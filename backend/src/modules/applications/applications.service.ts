import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { BatchesService } from '../batches/batches.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
    private batchesService: BatchesService,
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
          lecturer: { select: { id: true, name: true, email: true } },
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
      include: {
        position: true,
        student: true,
        lecturer: { select: { id: true, name: true, email: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return { success: true, data: application };
  }

  /**
   * CORE CONSTRAINT 1: Mỗi SV chỉ được 1 đơn hợp lệ trong 1 đợt
   * "Hợp lệ" = đơn có status: applied, screening, interview, department_approved
   * Nếu SV đã có đơn hợp lệ trong đợt này → reject
   */
  private async validateOneActiveAppPerBatch(studentId: string, batchId: string, excludeAppId?: string): Promise<void> {
    const validStatuses: ApplicationStatus[] = ['applied', 'screening', 'interview', 'department_approved'];

    const whereClause: any = {
      studentId,
      batchId,
      status: { in: validStatuses },
    };
    if (excludeAppId) {
      whereClause.id = { not: excludeAppId };
    }

    const existing = await this.prisma.application.findFirst({ where: whereClause });
    if (existing) {
      throw new ConflictException(
        `Bạn đã có đơn ứng tuyển hợp lệ trong đợt thực tập này. Mỗi sinh viên chỉ được 1 đơn hợp lệ trong 1 đợt.`,
      );
    }
  }

  /**
   * CORE CONSTRAINT 4: Kiểm tra điều kiện SV trước khi nộp đơn
   * - Trạng thái học tập phải là "active"
   * - Số tín chỉ tích lũy phải >= minCredits
   */
  private async validateStudentEligibility(studentId: string): Promise<void> {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId: studentId } });
    if (!profile) {
      throw new BadRequestException('Không tìm thấy hồ sơ sinh viên. Vui lòng cập nhật hồ sơ trước.');
    }
    if (profile.studyStatus !== 'active') {
      throw new BadRequestException(
        `Trạng thái học tập hiện tại là "${profile.studyStatus}". Chỉ sinh viên đang học mới được phép nộp đơn.`,
      );
    }
    if (profile.minCredits > 0 && profile.currentCredits < profile.minCredits) {
      throw new BadRequestException(
        `Bạn cần tối thiểu ${profile.minCredits} tín chỉ để nộp đơn. Hiện tại bạn có ${profile.currentCredits} tín chỉ.`,
      );
    }
  }

  /**
   * CORE CONSTRAINT 3: Công ty phải được Admin phê duyệt cho từng Batch
   */
  private async validateCompanyApprovedForBatch(companyId: string, batchId: string): Promise<void> {
    const approval = await this.prisma.companyBatch.findUnique({
      where: { companyId_batchId: { companyId, batchId } },
    });
    if (!approval) {
      throw new BadRequestException(
        'Công ty chưa được đăng ký tham gia đợt thực tập này.',
      );
    }
    if (approval.status !== 'approved') {
      throw new BadRequestException(
        `Công ty đang trong trạng thái "${approval.status}". Vui lòng chờ admin phê duyệt.`,
      );
    }
  }

  async create(dto: any, studentId: string) {
    // 1. Check if student can apply (active batch, allowStudentApplication)
    const { can, activeBatchId, batchName } = await this.batchesService.canStudentApply();
    if (!can || !activeBatchId) {
      throw new BadRequestException(
        'Hiện không có đợt thực tập nào cho phép nộp đơn. Vui lòng đợi admin mở đợt thực tập mới.',
      );
    }

    // 2. Validate student eligibility (study status, credits)
    await this.validateStudentEligibility(studentId);

    // 3. Get position to find company
    const position = await this.prisma.position.findUnique({ where: { id: dto.positionId } });
    if (!position) throw new NotFoundException('Không tìm thấy vị trí tuyển dụng.');

    // 4. Validate company is approved for this batch
    await this.validateCompanyApprovedForBatch(position.companyId, activeBatchId);

    // 5. Check if already applied to this position
    const existingPosApp = await this.prisma.application.findUnique({
      where: { positionId_studentId: { positionId: dto.positionId, studentId } },
    });
    if (existingPosApp) {
      throw new ConflictException('Bạn đã ứng tuyển vị trí này rồi.');
    }

    // 6. CORE CONSTRAINT 1: Check one active app per batch
    await this.validateOneActiveAppPerBatch(studentId, activeBatchId);

    // 7. CORE CONSTRAINT 5: Check company max students for this batch
    const companyBatch = await this.prisma.companyBatch.findUnique({
      where: { companyId_batchId: { companyId: position.companyId, batchId: activeBatchId } },
    });
    if (companyBatch && companyBatch.assignedStudentCount >= companyBatch.maxStudents) {
      throw new BadRequestException(
        `Công ty đã đạt giới hạn ${companyBatch.maxStudents} sinh viên cho đợt này.`,
      );
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        ...dto,
        studentId,
        batchId: activeBatchId,
        status: 'applied',
      },
      include: {
        position: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Create ApprovalItem so a lecturer must approve before the company can see this application
    await this.prisma.approvalItem.create({
      data: {
        applicationId: application.id,
        studentId,
        companyId: application.position?.companyId,
        positionId: application.positionId,
        level: 'lecturer',
        status: 'pending',
      },
    });

    // Log
    await this.logsService.logAction({
      logType: 'system',
      actorId: studentId,
      actorName: application.student?.name,
      actorRole: 'student',
      subject: `Sinh viên nộp đơn ứng tuyển: ${application.position?.title}`,
      message: `Sinh viên "${application.student?.name}" đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}" trong đợt "${batchName}". Đơn đang chờ giảng viên duyệt.`,
      metadata: { applicationId: application.id, positionId: application.positionId, studentId, batchId: activeBatchId },
    });

    // Notify lecturers that a student applied and needs their approval
    const lecturers = await this.prisma.user.findMany({ where: { role: 'lecturer' }, select: { id: true } });
    await Promise.all(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            userId: lecturer.id,
            type: 'info',
            title: 'Sinh viên nộp đơn thực tập',
            message: `Sinh viên "${application.student?.name}" đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}". Vui lòng xem xét và phê duyệt.`,
            link: `/lecturer/approval`,
          },
        }),
      ),
    );

    // Notify student their application is submitted and pending lecturer approval
    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'info',
        title: 'Đơn ứng tuyển đã được gửi',
        message: `Bạn đã nộp đơn ứng tuyển cho vị trí "${application.position?.title}". Đơn đang chờ giảng viên duyệt trước khi công ty xem được.`,
        link: `/applications/${application.id}`,
      },
    });

    return { success: true, data: application };
  }

  async updateStatus(id: string, dto: any, userId: string, userRole?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { position: { select: { id: true, companyId: true } }, student: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const isStudent = application.studentId === userId;
    const isCompany = application.position?.companyId === userId;
    const isAdmin = userRole === 'admin';
    const isLecturer = userRole === 'lecturer';

    if (!isStudent && !isCompany && !isAdmin && !isLecturer) {
      throw new NotFoundException('Not authorized to update this application');
    }

    // CORE CONSTRAINT 7: Lock application after lecturer approves (department_approved)
    if (application.status === 'department_approved' && isStudent) {
      throw new BadRequestException(
        'Đơn đã được giảng viên duyệt và không thể thay đổi trạng thái rút đơn.',
      );
    }

    if (dto.status === 'withdrawn' && isStudent) {
      const allowedStatuses = ['applied', 'screening', 'interview'];
      if (!allowedStatuses.includes(application.status)) {
        throw new ConflictException('Không thể rút đơn ở trạng thái hiện tại.');
      }
    }

    // Company approves → set companyApprovedAt
    const updateData: any = { status: dto.status };
    if (isCompany && dto.status === 'screening') {
      updateData.companyApprovedAt = new Date();
      updateData.lecturerId = dto.lecturerId || null;
    }
    // Lecturer approves → set lecturerApprovedAt
    if ((isLecturer || isAdmin) && dto.status === 'department_approved') {
      updateData.lecturerApprovedAt = new Date();
      if (dto.lecturerId) updateData.lecturerId = dto.lecturerId;

      // Assign lecturer to student
      if (dto.lecturerId) {
        await this.prisma.lecturerAssignment.upsert({
          where: { studentId: application.studentId },
          create: {
            lecturerId: dto.lecturerId,
            studentId: application.studentId,
            batchId: application.batchId,
            status: 'active',
          },
          update: {
            lecturerId: dto.lecturerId,
            batchId: application.batchId,
            status: 'active',
          },
        });
      }
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
    });

    // Log
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
      message: `"${actor?.name}" (${actor?.role}) đã cập nhật trạng thái đơn của "${app?.student?.name}" thành "${dto.status}".`,
      metadata: { applicationId: id, newStatus: dto.status },
    });

    // Notify student
    const notifyStatuses = ['withdrawn', 'screening', 'interview', 'department_approved', 'rejected'];
    if (notifyStatuses.includes(dto.status)) {
      const statusMessages: Record<string, { title: string; message: string }> = {
        withdrawn: { title: 'Đơn ứng tuyển đã được rút', message: `Đơn cho vị trí "${app?.position?.title}" đã được rút lại.` },
        screening: { title: 'Đơn đang được xem xét', message: `Đơn cho vị trí "${app?.position?.title}" đang được doanh nghiệp xem xét.` },
        interview: { title: 'Lịch phỏng vấn', message: `Đơn cho vị trí "${app?.position?.title}" đã được mời phỏng vấn.` },
        department_approved: { title: 'Đơn đã được duyệt', message: `Đơn cho vị trí "${app?.position?.title}" đã được giảng viên duyệt. Chúc mừng bạn!` },
        rejected: { title: 'Đơn không được chấp nhận', message: `Đơn cho vị trí "${app?.position?.title}" không được chấp nhận.` },
      };
      const config = statusMessages[dto.status];
      if (config) {
        await this.prisma.notification.create({
          data: {
            userId: application.studentId,
            type: dto.status === 'department_approved' ? 'success' : dto.status === 'rejected' ? 'error' : 'info',
            title: config.title,
            message: config.message,
            link: `/applications/${id}`,
          },
        });
      }
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
    // Only show applications that have been approved by a lecturer (status = screening+).
    // Applications in 'applied' status are pending lecturer approval and not visible to company yet.
    const applications = await this.prisma.application.findMany({
      where: {
        position: { companyId },
        status: { in: ['screening', 'interview', 'department_approved'] },
      },
      include: { position: true, student: true },
    });
    return { success: true, data: applications };
  }

  async getStudentsForEvaluation() {
    const applications = await this.prisma.application.findMany({
      where: { status: 'department_approved' },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        position: { select: { id: true, title: true, company: { select: { id: true, name: true } } } },
        lecturer: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true, semester: true, academicYear: true } },
      },
    });

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
          lecturerName: app.lecturer?.name,
          batchName: app.batch ? `${app.batch.name} (${app.batch.semester} ${app.batch.academicYear})` : null,
        });
      }
    });

    return { success: true, data: Array.from(uniqueStudents.values()) };
  }
}
