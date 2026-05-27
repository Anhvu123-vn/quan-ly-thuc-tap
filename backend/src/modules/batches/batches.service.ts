import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  ActivateBatchDto,
} from './dto/batches.dto';

@Injectable()
export class BatchesService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  /**
   * Get all batches (admin)
   */
  async findAll(query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { semester: { contains: search, mode: 'insensitive' } },
        { academicYear: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [batches, total] = await Promise.all([
      this.prisma.internshipBatch.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { positions: true, applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.internshipBatch.count({ where }),
    ]);

    return {
      success: true,
      data: batches,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get active batch (for frontend to check if posting/apply is allowed)
   */
  async getActiveBatch() {
    const batch = await this.prisma.internshipBatch.findFirst({
      where: { status: 'active' },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { positions: true, applications: true } },
      },
    });
    return { success: true, data: batch };
  }

  /**
   * Get upcoming batches (for display purposes)
   */
  async getUpcomingBatches() {
    const batches = await this.prisma.internshipBatch.findMany({
      where: { status: { in: ['upcoming', 'active'] } },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
    return { success: true, data: batches };
  }

  /**
   * Get single batch by ID
   */
  async findOne(id: string) {
    const batch = await this.prisma.internshipBatch.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { positions: true, applications: true } },
      },
    });
    if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập');
    return { success: true, data: batch };
  }

  /**
   * Create a new batch (admin only)
   */
  async create(dto: CreateBatchDto, actorId: string) {
    // Check for duplicate name in same semester/academic year
    const existing = await this.prisma.internshipBatch.findFirst({
      where: {
        semester: dto.semester,
        academicYear: dto.academicYear,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Đợt thực tập ${dto.semester} ${dto.academicYear} đã tồn tại`,
      );
    }

    const batch = await this.prisma.internshipBatch.create({
      data: {
        name: dto.name,
        description: dto.description,
        semester: dto.semester,
        academicYear: dto.academicYear,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        maxStudents: dto.maxStudents ?? 0,
        createdBy: actorId,
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });

    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorRole: 'admin',
      subject: `Tạo đợt thực tập: ${batch.name}`,
      message: `Admin đã tạo đợt thực tập mới "${batch.name}" (${batch.semester} ${batch.academicYear}).`,
      metadata: { batchId: batch.id, semester: batch.semester, academicYear: batch.academicYear },
    });

    return { success: true, data: batch };
  }

  /**
   * Update batch (admin only)
   */
  async update(id: string, dto: UpdateBatchDto, actorId: string) {
    const existing = await this.prisma.internshipBatch.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy đợt thực tập');

    const updated = await this.prisma.internshipBatch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.semester !== undefined && { semester: dto.semester }),
        ...(dto.academicYear !== undefined && { academicYear: dto.academicYear }),
        ...(dto.applicationDeadline !== undefined && {
          applicationDeadline: new Date(dto.applicationDeadline),
        }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.maxStudents !== undefined && { maxStudents: dto.maxStudents }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.allowCompanyPosting !== undefined && { allowCompanyPosting: dto.allowCompanyPosting }),
        ...(dto.allowStudentApplication !== undefined && { allowStudentApplication: dto.allowStudentApplication }),
      },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { positions: true, applications: true } },
      },
    });

    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorRole: 'admin',
      subject: `Cập nhật đợt thực tập: ${updated.name}`,
      message: `Admin đã cập nhật đợt thực tập "${updated.name}". Trạng thái: ${updated.status}, Đăng tin: ${updated.allowCompanyPosting}, Nộp đơn: ${updated.allowStudentApplication}.`,
      metadata: {
        batchId: id,
        changes: dto,
        status: updated.status,
        allowCompanyPosting: updated.allowCompanyPosting,
        allowStudentApplication: updated.allowStudentApplication,
      },
    });

    return { success: true, data: updated };
  }

  /**
   * Activate a batch: set status=active and enable flags
   */
  async activate(id: string, dto: ActivateBatchDto, actorId: string) {
    const batch = await this.prisma.internshipBatch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập');

    // Deactivate any currently active batches
    await this.prisma.internshipBatch.updateMany({
      where: { status: 'active' },
      data: { status: 'closed', allowCompanyPosting: false, allowStudentApplication: false },
    });

    const updated = await this.prisma.internshipBatch.update({
      where: { id },
      data: {
        status: 'active',
        allowCompanyPosting: dto.allowCompanyPosting,
        allowStudentApplication: dto.allowStudentApplication,
      },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { positions: true, applications: true } },
      },
    });

    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorRole: 'admin',
      subject: `Kích hoạt đợt thực tập: ${updated.name}`,
      message: `Admin đã kích hoạt đợt thực tập "${updated.name}". Cho phép đăng tin: ${dto.allowCompanyPosting}, Cho phép nộp đơn: ${dto.allowStudentApplication}.`,
      metadata: {
        batchId: id,
        allowCompanyPosting: dto.allowCompanyPosting,
        allowStudentApplication: dto.allowStudentApplication,
      },
    });

    return {
      success: true,
      data: updated,
      message: `Đợt thực tập "${updated.name}" đã được kích hoạt`,
    };
  }

  /**
   * Close a batch
   */
  async close(id: string, actorId: string) {
    const batch = await this.prisma.internshipBatch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập');

    const updated = await this.prisma.internshipBatch.update({
      where: { id },
      data: {
        status: 'closed',
        allowCompanyPosting: false,
        allowStudentApplication: false,
      },
    });

    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorRole: 'admin',
      subject: `Đóng đợt thực tập: ${updated.name}`,
      message: `Admin đã đóng đợt thực tập "${updated.name}".`,
      metadata: { batchId: id },
    });

    return { success: true, data: updated };
  }

  /**
   * Delete batch (only upcoming batches, not active)
   */
  async delete(id: string, actorId: string) {
    const batch = await this.prisma.internshipBatch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập');
    if (batch.status === 'active') {
      throw new BadRequestException('Không thể xóa đợt thực tập đang hoạt động. Hãy đóng đợt trước.');
    }

    // Check if batch has positions/applications
    const [positionCount, applicationCount] = await Promise.all([
      this.prisma.position.count({ where: { batchId: id } }),
      this.prisma.application.count({ where: { batchId: id } }),
    ]);

    if (positionCount > 0 || applicationCount > 0) {
      throw new BadRequestException(
        `Đợt thực tập có ${positionCount} tin tuyển dụng và ${applicationCount} đơn ứng tuyển. Không thể xóa.`,
      );
    }

    await this.prisma.internshipBatch.delete({ where: { id } });

    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorRole: 'admin',
      subject: `Xóa đợt thực tập: ${batch.name}`,
      message: `Admin đã xóa đợt thực tập "${batch.name}".`,
      metadata: { batchId: id },
    });

    return { success: true, message: 'Đã xóa đợt thực tập' };
  }

  /**
   * Check if company can post a new position
   */
  async canCompanyPost(): Promise<{ can: boolean; activeBatchId?: string }> {
    const activeBatch = await this.prisma.internshipBatch.findFirst({
      where: { status: 'active', allowCompanyPosting: true },
    });
    if (!activeBatch) return { can: false };
    return { can: true, activeBatchId: activeBatch.id };
  }

  /**
   * Check if student can apply
   */
  async canStudentApply(): Promise<{ can: boolean; activeBatchId?: string; batchName?: string }> {
    const activeBatch = await this.prisma.internshipBatch.findFirst({
      where: { status: 'active', allowStudentApplication: true },
    });
    if (!activeBatch) return { can: false };
    return { can: true, activeBatchId: activeBatch.id, batchName: activeBatch.name };
  }

  /**
   * Get stats for admin dashboard
   */
  async getStats() {
    const [total, upcoming, active, closed, activeBatch] = await Promise.all([
      this.prisma.internshipBatch.count(),
      this.prisma.internshipBatch.count({ where: { status: 'upcoming' } }),
      this.prisma.internshipBatch.count({ where: { status: 'active' } }),
      this.prisma.internshipBatch.count({ where: { status: 'closed' } }),
      this.prisma.internshipBatch.findFirst({
        where: { status: 'active' },
        include: { _count: { select: { positions: true, applications: true } } },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        upcoming,
        active,
        closed,
        activeBatch,
      },
    };
  }
}
