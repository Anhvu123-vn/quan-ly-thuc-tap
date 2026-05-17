import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async findAll(query: any, userId: string, userRole: string) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    if (userRole === 'student') {
      where.studentId = userId;
    } else if (userRole === 'company') {
      where.position = { companyId: userId };
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          position: true,
          student: true,
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      success: true,
      data: applications,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { position: true, student: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return { success: true, data: application };
  }

  async create(dto: any, studentId: string) {
    const existing = await this.prisma.application.findFirst({
      where: { positionId: dto.positionId, studentId },
    });
    if (existing) throw new ConflictException('Already applied to this position');

    const application = await this.prisma.application.create({
      data: { ...dto, studentId },
      include: { position: true, student: { select: { id: true, name: true, email: true } } },
    });

    // Log student application
    await this.logsService.logAction({
      logType: 'system',
      actorId: studentId,
      actorName: application.student?.name,
      actorRole: 'student',
      subject: `Sinh viên nộp đơn ứng tuyển: ${application.position?.title}`,
      message: `Sinh viên "${application.student?.name}" đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}".`,
      metadata: { applicationId: application.id, positionId: application.positionId, studentId },
    });

    // Notify the company about the new application
    if (application.position?.companyId) {
      await this.prisma.notification.create({
        data: {
          userId: application.position.companyId,
          type: 'info',
          title: 'Đơn ứng tuyển mới',
          message: `Sinh viên "${application.student?.name}" đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}".`,
          link: `/company/applications/${application.id}`,
        },
      });
    }

    // Notify the student about their application submission
    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'info',
        title: 'Nộp đơn ứng tuyển thành công',
        message: `Bạn đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}". Đơn đang chờ được xem xét.`,
        link: `/applications/${application.id}`,
      },
    });

    // Notify all lecturers about the new student application
    const lecturers = await this.prisma.user.findMany({ where: { role: 'lecturer' }, select: { id: true } });
    await Promise.all(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            userId: lecturer.id,
            type: 'info',
            title: 'Sinh viên nộp đơn thực tập',
            message: `Sinh viên "${application.student?.name}" đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}".`,
            link: `/lecturer/applications`,
          },
        }),
      ),
    );

    // Create approval item for lecturer level
    await this.prisma.approvalItem.create({
      data: {
        applicationId: application.id,
        studentId: studentId,
        companyId: application.position?.companyId,
        positionId: application.positionId,
        level: 'lecturer',
        status: 'pending',
      },
    });

    return { success: true, data: application };
  }

  async updateStatus(id: string, dto: any, userId: string, userRole?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { position: { select: { id: true, companyId: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');

    // Check permissions:
    // - Student: can only withdraw their own applications
    // - Company: can update applications to their positions
    // - Lecturer: can update applications
    // - Admin: can update any application
    const isStudent = application.studentId === userId;
    const isCompany = application.position?.companyId === userId;
    const isAdmin = userRole === 'admin';
    const isLecturer = userRole === 'lecturer';

    // Allow company to update status of applications to their positions
    // Allow student to withdraw their own application
    // Allow lecturer/admin to update status
    if (!isStudent && !isCompany && !isAdmin && !isLecturer) {
      throw new NotFoundException('Not authorized to update this application');
    }

    // Only allow withdrawal for certain statuses (student only)
    if (dto.status === 'withdrawn' && isStudent) {
      const allowedStatuses = ['applied', 'screening', 'interview', 'offer'];
      if (!allowedStatuses.includes(application.status)) {
        throw new ConflictException('Cannot withdraw application in current status');
      }
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
    });

    // Log application status update
    const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true } });
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: { student: { select: { name: true } }, position: { select: { title: true } } },
    });
    await this.logsService.logAction({
      logType: 'system',
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role,
      subject: `Cập nhật trạng thái đơn: ${app?.position?.title}`,
      message: `"${actor?.name}" (${actor?.role}) đã cập nhật trạng thái đơn ứng tuyển của "${app?.student?.name}" thành "${dto.status}".`,
      metadata: { applicationId: id, newStatus: dto.status },
    });

    // Notify the student when their application status changes
    const notifyStudent = dto.status === 'withdrawn' || dto.status === 'screening' || dto.status === 'interview';
    if (notifyStudent && app?.studentId) {
      const statusMessages: Record<string, { title: string; message: string }> = {
        withdrawn: { title: 'Đơn ứng tuyển đã được rút', message: `Đơn ứng tuyển cho vị trí "${app?.position?.title}" đã được rút lại.` },
        screening: { title: 'Đơn ứng tuyển đang được xem xét', message: `Đơn ứng tuyển cho vị trí "${app?.position?.title}" đang được doanh nghiệp xem xét.` },
        interview: { title: 'Lịch phỏng vấn', message: `Đơn ứng tuyển cho vị trí "${app?.position?.title}" đã được mời phỏng vấn.` },
      };
      const config = statusMessages[dto.status];
      await this.prisma.notification.create({
        data: {
          userId: app.studentId,
          type: 'info',
          title: config.title,
          message: config.message,
          link: `/applications/${id}`,
        },
      });
    }

    return { success: true, data: updated };
  }

  async getMyApplications(studentId: string) {
    const applications = await this.prisma.application.findMany({
      where: { studentId },
      include: { position: true },
    });
    return { success: true, data: applications };
  }

  async getApplicationsForCompany(companyId: string) {
    // Show all applications that lecturer has approved
    // Status: screening (waiting for company), interview, offer, department_approved (fully approved)
    // NOT showing: applied (waiting lecturer), rejected, withdrawn
    const applications = await this.prisma.application.findMany({
      where: { 
        position: { companyId },
        status: { in: ['screening', 'interview', 'department_approved'] }
      },
      include: { position: true, student: true },
    });
    return { success: true, data: applications };
  }

  async getStudentsForEvaluation() {
    // Get all students who have department_approved status
    const applications = await this.prisma.application.findMany({
      where: {
        status: 'department_approved'
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        position: {
          select: { 
            id: true, 
            title: true,
            company: {
              select: { id: true, name: true }
            }
          },
        },
      },
    });

    // Remove duplicates by studentId
    const uniqueStudents = new Map();
    applications.forEach((app: any) => {
      if (!uniqueStudents.has(app.studentId)) {
        uniqueStudents.set(app.studentId, {
          id: app.student.id,
          name: app.student.name,
          email: app.student.email,
          phone: app.student.phone,
          avatar: app.student.avatar,
          applicationId: app.id,
          positionTitle: app.position?.title,
          companyName: app.position?.company?.name,
        });
      }
    });

    return { success: true, data: Array.from(uniqueStudents.values()) };
  }
}
