import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Public')
@Controller()
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get public statistics' })
  async getStats() {
    const [totalUsers, students, lecturers, companies, admins, positions, applications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'lecturer' } }),
      this.prisma.user.count({ where: { role: 'company' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.position.count(),
      this.prisma.application.count(),
    ]);

    return {
      success: true,
      data: {
        users: { total: totalUsers, students, lecturers, companies, admins },
        positions,
        applications,
      },
    };
  }
}
