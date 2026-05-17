import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, status, level } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (level) where.level = level;

    const [approvals, total] = await Promise.all([
      this.prisma.approvalItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          company: {
            select: { id: true, name: true }
          },
          position: {
            select: { id: true, title: true }
          },
          reviewer: {
            select: { id: true, name: true }
          }
        }
      }),
      this.prisma.approvalItem.count({ where }),
    ]);

    return { success: true, data: approvals, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.approvalItem.findUnique({ 
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        company: { select: { id: true, name: true } },
        position: { select: { id: true, title: true } },
        reviewer: { select: { id: true, name: true } }
      }
    });
    if (!item) throw new NotFoundException('Approval item not found');
    return { success: true, data: item };
  }

  async review(id: string, dto: any, userId: string) {
    const item = await this.prisma.approvalItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Approval item not found');

    // Get reviewer info for logging
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    // If this is a position approval, update position status
    if (item.positionId) {
      const position = await this.prisma.position.findUnique({ where: { id: item.positionId } });
      const positionStatus = dto.status === 'approved' ? 'active' : 'draft';
      await this.prisma.position.update({
        where: { id: item.positionId },
        data: { status: positionStatus },
      });

      // Notify the company about the admin's decision
      const isApproved = dto.status === 'approved';
      await this.prisma.notification.create({
        data: {
          userId: item.companyId,
          type: isApproved ? 'approval' : 'info',
          title: isApproved ? 'Tin tuyển dụng đã được duyệt!' : 'Tin tuyển dụng bị từ chối',
          message: isApproved
            ? `Tin tuyển dụng "${position?.title}" đã được admin phê duyệt và hiển thị công khai.`
            : `Tin tuyển dụng "${position?.title}" đã bị từ chối. Lý do: ${dto.comment || 'Không có'}`.slice(0, 500),
          link: `/company/jobs`,
        },
      });

      // Log admin approval/rejection of position
      await this.logsService.logAction({
        logType: 'system',
        actorId: reviewer?.id,
        actorName: reviewer?.name,
        actorRole: reviewer?.role,
        subject: isApproved
          ? `Admin duyệt tin tuyển dụng: ${position?.title}`
          : `Admin từ chối tin tuyển dụng: ${position?.title}`,
        message: isApproved
          ? `Admin "${reviewer?.name}" đã phê duyệt tin tuyển dụng "${position?.title}".`
          : `Admin "${reviewer?.name}" đã từ chối tin tuyển dụng "${position?.title}". Lý do: ${dto.comment || 'Không có'}`,
        metadata: { positionId: item.positionId, approvalResult: dto.status, comment: dto.comment },
      });
    }

    // If this is an application approval, update application status
    if (item.applicationId) {
      const application = await this.prisma.application.findUnique({
        where: { id: item.applicationId },
        include: { student: { select: { name: true } }, position: { select: { title: true, companyId: true } } },
      });
      
      // Lecturer approves → create department approval item (two-step approval)
      // Department approves → application is fully approved
      const appIsApproved = dto.status === 'approved';
      let applicationStatus: 'screening' | 'department_approved' | 'rejected';
      
        if (appIsApproved) {
          if (item.level === 'lecturer') {
            applicationStatus = 'screening';
            await this.prisma.approvalItem.create({
              data: {
                applicationId: item.applicationId,
                studentId: item.studentId,
                companyId: item.companyId,
                positionId: item.positionId,
                level: 'department',
                status: 'pending',
              },
            });

            // Notify company when lecturer approves - company can now see and review the application
            if (item.companyId) {
              await this.prisma.notification.create({
                data: {
                  userId: item.companyId,
                  type: 'info',
                  title: 'Sinh viên ứng tuyển thực tập',
                  message: `Sinh viên "${application?.student?.name}" đã được giảng viên duyệt và gửi đơn ứng tuyển vị trí "${application?.position?.title}". Vui lòng vào xem và phê duyệt.`,
                  link: `/company/applications/${item.applicationId}`,
                },
              });
            }
          } else {
            applicationStatus = 'department_approved';
          }
        } else {
          applicationStatus = 'rejected';
        }
      
      await this.prisma.application.update({
        where: { id: item.applicationId },
        data: { status: applicationStatus },
      });

      // Notify the student about the application decision
      if (item.studentId) {
        let notifTitle: string;
        let notifMessage: string;
        
        if (item.level === 'lecturer') {
          if (appIsApproved) {
            notifTitle = 'Đơn đã được giảng viên duyệt!';
            notifMessage = `Đơn ứng tuyển vị trí "${application?.position?.title}" đã được giảng viên duyệt. Đơn đang chờ phòng đào tạo xét duyệt.`;
          } else {
            notifTitle = 'Đơn ứng tuyển bị từ chối';
            notifMessage = `Đơn ứng tuyển vị trí "${application?.position?.title}" đã bị từ chối. Lý do: ${dto.comment || 'Không có'}`.slice(0, 500);
          }
        } else {
          if (appIsApproved) {
            notifTitle = 'Đơn đã được phòng đào tạo duyệt!';
            notifMessage = `Đơn ứng tuyển vị trí "${application?.position?.title}" đã được phòng đào tạo duyệt. Doanh nghiệp đang xem xét đơn của bạn.`;
          } else {
            notifTitle = 'Đơn ứng tuyển bị từ chối';
            notifMessage = `Đơn ứng tuyển vị trí "${application?.position?.title}" đã bị từ chối. Lý do: ${dto.comment || 'Không có'}`.slice(0, 500);
          }
        }
        
        await this.prisma.notification.create({
          data: {
            userId: item.studentId,
            type: appIsApproved ? 'approval' : 'info',
            title: notifTitle,
            message: notifMessage,
            link: `/applications/${item.applicationId}`,
          },
        });
      }

      // Log lecturer/admin approval of application
      await this.logsService.logAction({
        logType: 'system',
        actorId: reviewer?.id,
        actorName: reviewer?.name,
        actorRole: reviewer?.role,
        subject: appIsApproved
          ? `Phê duyệt đơn ứng tuyển: ${application?.position?.title}`
          : `Từ chối đơn ứng tuyển: ${application?.position?.title}`,
        message: appIsApproved
          ? `${reviewer?.name} đã phê duyệt đơn ứng tuyển của sinh viên "${application?.student?.name}" cho vị trí "${application?.position?.title}".`
          : `${reviewer?.name} đã từ chối đơn ứng tuyển của sinh viên "${application?.student?.name}" cho vị trí "${application?.position?.title}". Lý do: ${dto.comment || 'Không có'}`,
        metadata: { applicationId: item.applicationId, studentId: item.studentId, approvalResult: dto.status, comment: dto.comment },
      });
    }

    const updated = await this.prisma.approvalItem.update({
      where: { id },
      data: {
        status: dto.status,
        reviewerId: userId,
        comments: dto.comment,
        reviewedAt: new Date()
      },
    });
    return { success: true, data: updated };
  }

  async getMyPendingApprovals(reviewerId: string) {
    const items = await this.prisma.approvalItem.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        company: { select: { id: true, name: true } },
        position: { select: { id: true, title: true } },
        reviewer: { select: { id: true, name: true } }
      }
    });
    return { success: true, data: items };
  }
}
