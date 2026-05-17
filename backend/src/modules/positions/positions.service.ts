import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class PositionsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, status, workType, location, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    // Only show active positions to public
    where.status = 'active';
    if (workType) where.workType = workType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [positions, total] = await Promise.all([
      this.prisma.position.findMany({
        where,
        skip,
        take: Number(limit),
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.position.count({ where }),
    ]);

    return {
      success: true,
      data: positions,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } }, _count: { select: { applications: true } } },
    });
    if (!position) throw new NotFoundException('Position not found');
    return { success: true, data: position };
  }

  async create(dto: any, userId: string) {
    // Create position with draft status (pending approval)
    const position = await this.prisma.position.create({
      data: { ...dto, companyId: userId, status: 'draft' },
      include: { company: { select: { id: true, name: true } } },
    });

    // Create approval request for admin to review
    await this.prisma.approvalItem.create({
      data: {
        companyId: userId,
        positionId: position.id,
        level: 'department',
        status: 'pending',
      },
    });

    // Notify all admins about the new position pending approval
    const admins = await this.prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'info',
            title: 'Tin tuyển dụng mới cần duyệt',
            message: `Doanh nghiệp "${position.company.name}" vừa đăng tin tuyển dụng mới: "${position.title}". Vui lòng vào kiểm tra và phê duyệt.`,
            link: `/admin`,
          },
        }),
      ),
    );

    // Log system activity
    await this.logsService.logAction({
      logType: 'system',
      actorId: userId,
      actorName: position.company.name,
      actorRole: 'company',
      subject: `Doanh nghiệp đăng tin tuyển dụng mới: ${position.title}`,
      message: `Doanh nghiệp "${position.company.name}" đã tạo tin tuyển dụng "${position.title}" đang chờ admin duyệt.`,
      metadata: { positionId: position.id, positionTitle: position.title, companyId: userId },
    });

    return { success: true, data: position, message: 'Vị trí tuyển dụng đang chờ admin duyệt' };
  }

  async update(id: string, dto: any, userId: string) {
    const position = await this.prisma.position.findUnique({ where: { id } });
    if (!position) throw new NotFoundException('Position not found');
    if (position.companyId !== userId) throw new NotFoundException('Not authorized');

    // If company updates a draft position, it stays draft until re-approved
    const updated = await this.prisma.position.update({
      where: { id },
      data: dto,
      include: { company: { select: { id: true, name: true } } },
    });
    return { success: true, data: updated };
  }

  async delete(id: string, userId: string) {
    const position = await this.prisma.position.findUnique({ where: { id } });
    if (!position) throw new NotFoundException('Position not found');
    if (position.companyId !== userId) throw new NotFoundException('Not authorized');

    await this.prisma.position.delete({ where: { id } });
    return { success: true, message: 'Position deleted successfully' };
  }

  async getMyPositions(companyId: string) {
    const positions = await this.prisma.position.findMany({
      where: { companyId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: positions };
  }
}
