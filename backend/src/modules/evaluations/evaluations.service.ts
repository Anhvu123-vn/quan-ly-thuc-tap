import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any, userId: string, userRole: string) {
    const { page = 1, limit = 10, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (userRole === 'student') where.studentId = userId;
    if (userRole === 'company' || userRole === 'lecturer') where.evaluatorId = userId;

    const [evaluations, total] = await Promise.all([
      this.prisma.evaluation.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          evaluator: { select: { id: true, name: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.evaluation.count({ where }),
    ]);

    return { success: true, data: evaluations, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        evaluator: { select: { id: true, name: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });
    if (!evaluation) throw new NotFoundException('Evaluation not found');
    return { success: true, data: evaluation };
  }

  async create(dto: any, evaluatorId: string) {
    const evaluation = await this.prisma.evaluation.create({
      data: { ...dto, evaluatorId },
      include: {
        evaluator: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
    });

    // Notify the student about the new evaluation
    if (evaluation.studentId) {
      await this.prisma.notification.create({
        data: {
          userId: evaluation.studentId,
          type: 'info',
          title: 'Bạn có đánh giá mới',
          message: `Giảng viên "${evaluation.evaluator?.name}" đã gửi đánh giá "${dto.evaluationType}" cho bạn. Điểm tổng: ${dto.overallScore}.`,
          link: `/student/evaluations`,
        },
      });
    }

    return { success: true, data: evaluation };
  }

  async update(id: string, dto: any, evaluatorId: string) {
    const evaluation = await this.prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation) throw new NotFoundException('Evaluation not found');
    if (evaluation.evaluatorId !== evaluatorId) throw new NotFoundException('Not authorized');

    const updated = await this.prisma.evaluation.update({
      where: { id },
      data: dto,
      include: { evaluator: { select: { id: true, name: true } }, student: { select: { id: true, name: true } } },
    });
    return { success: true, data: updated };
  }

  async getForStudent(studentId: string) {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { studentId },
      include: { evaluator: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: evaluations };
  }

  async getMyEvaluations(evaluatorId: string) {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { evaluatorId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: evaluations };
  }
}
