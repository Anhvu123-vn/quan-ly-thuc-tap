import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CompanyBatchService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  /**
   * Admin: Approve or reject a company for a batch
   */
  async review(companyBatchId: string, dto: { status: string; rejectionReason?: string; maxStudents?: number }, actorId: string) {
    const record = await this.prisma.companyBatch.findUnique({ where: { id: companyBatchId } });
    if (!record) throw new NotFoundException('Không tìm thấy bản ghi phê duyệt.');
    if (record.status !== 'pending') {
      throw new BadRequestException('Công ty đã được xử lý cho đợt này.');
    }

    const updated = await this.prisma.companyBatch.update({
      where: { id: companyBatchId },
      data: {
        status: dto.status as any,
        rejectionReason: dto.rejectionReason || null,
        maxStudents: dto.maxStudents ?? record.maxStudents,
        approvedBy: actorId,
        approvedAt: new Date(),
      },
      include: {
        company: { select: { id: true, name: true, email: true } },
        batch: { select: { id: true, name: true } },
      },
    });

    // Notify company
    const actor = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
    if (updated.status === 'approved') {
      await this.prisma.notification.create({
        data: {
          userId: updated.companyId,
          type: 'success',
          title: 'Được chấp thuận tham gia đợt thực tập',
          message: `Công ty "${updated.company.name}" đã được phê duyệt tham gia đợt "${updated.batch.name}". Bạn có thể bắt đầu đăng tin tuyển dụng.`,
          link: '/company',
        },
      });
    } else if (updated.status === 'rejected') {
      await this.prisma.notification.create({
        data: {
          userId: updated.companyId,
          type: 'error',
          title: 'Không được chấp thuận tham gia đợt thực tập',
          message: `Công ty "${updated.company.name}" không được phê duyệt tham gia đợt "${updated.batch.name}".${dto.rejectionReason ? ` Lý do: ${dto.rejectionReason}` : ''}`,
          link: '/company',
        },
      });
    }

    // Log
    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorName: actor?.name,
      actorRole: 'admin',
      subject: `Admin phê duyệt công ty "${updated.company.name}" cho đợt "${updated.batch.name}"`,
      message: `Admin "${actor?.name}" đã ${dto.status === 'approved' ? 'phê duyệt' : 'từ chối'} công ty "${updated.company.name}" tham gia đợt "${updated.batch.name}".${dto.rejectionReason ? ` Lý do: ${dto.rejectionReason}` : ''}`,
      metadata: { companyBatchId, status: dto.status, companyId: updated.companyId, batchId: updated.batchId },
    });

    return { success: true, data: updated };
  }

  /**
   * Admin: Get all company-batch approvals for a batch
   */
  async findByBatch(batchId: string, query: any) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;
    const where: any = { batchId };
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      this.prisma.companyBatch.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          company: { select: { id: true, name: true, email: true, phone: true } },
          batch: { select: { id: true, name: true, semester: true, academicYear: true } },
          approvedByUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.companyBatch.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Company: Request to join a batch (or admin creates it)
   */
  async registerCompanyForBatch(companyId: string, batchId: string, dto: { maxStudents?: number }) {
    // Verify company account is approved
    const company = await this.prisma.user.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Không tìm thấy tài khoản công ty.');
    if (company.status !== 'active') {
      throw new BadRequestException('Tài khoản công ty chưa được phê duyệt. Vui lòng chờ quản trị viên kích hoạt.');
    }

    const existing = await this.prisma.companyBatch.findUnique({
      where: { companyId_batchId: { companyId, batchId } },
    });
    if (existing) {
      throw new BadRequestException('Công ty đã đăng ký tham gia đợt này rồi.');
    }

    const batch = await this.prisma.internshipBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập.');

    const record = await this.prisma.companyBatch.create({
      data: {
        companyId,
        batchId,
        status: 'pending',
        maxStudents: dto.maxStudents ?? 5,
      },
      include: {
        company: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
      },
    });

    // Notify admins
    const admins = await this.prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'info',
            title: 'Công ty đăng ký tham gia đợt thực tập',
            message: `Công ty "${record.company.name}" muốn tham gia đợt "${record.batch.name}". Vui lòng xem xét và phê duyệt.`,
            link: '/admin/batches',
          },
        }),
      ),
    );

    return { success: true, data: record };
  }

  /**
   * Admin: Get all pending requests across all batches
   */
  async findAllPending(query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.companyBatch.findMany({
        where: { status: 'pending' },
        skip,
        take: Number(limit),
        include: {
          company: { select: { id: true, name: true, email: true, phone: true } },
          batch: { select: { id: true, name: true, semester: true, academicYear: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.companyBatch.count({ where: { status: 'pending' } }),
    ]);

    return {
      success: true,
      data: records,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Company: Get its own batch approvals
   */
  async getMyCompanyBatches(companyId: string) {
    const records = await this.prisma.companyBatch.findMany({
      where: { companyId },
      include: {
        batch: { select: { id: true, name: true, semester: true, academicYear: true, status: true, allowCompanyPosting: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: records };
  }
}
