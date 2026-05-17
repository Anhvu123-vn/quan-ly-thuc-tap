import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [total, students, lecturers, companies, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'lecturer' } }),
      this.prisma.user.count({ where: { role: 'company' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
    ]);

    return {
      success: true,
      data: { total, students, lecturers, companies, admins },
    };
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, role, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: Number(limit) }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: user };
  }

  async getStudentProfile(userId: string) {
    let profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) profile = await this.prisma.studentProfile.create({ data: { userId } });
    return { success: true, data: profile };
  }

  async updateStudentProfile(userId: string, dto: any) {
    const profile = await this.prisma.studentProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
    return { success: true, data: profile };
  }

  async updateUser(id: string, dto: { name?: string; email?: string; role?: string; department?: string; phone?: string }) {
    const { role, ...rest } = dto;
    const data: any = { ...rest };
    if (role) data.role = role;

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return { success: true, data: user };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted successfully' };
  }
}
