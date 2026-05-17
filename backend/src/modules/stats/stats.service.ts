import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      students,
      lecturers,
      companies,
      admins,
      positions,
      applications,
      approvedApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'lecturer' } }),
      this.prisma.user.count({ where: { role: 'company' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.position.count({ where: { status: 'active' } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: { in: ['department_approved'] } } }),
    ]);

    // Get top companies by application count
    const topCompaniesResult = await this.prisma.$queryRaw<Array<{ name: string; id: string; application_count: bigint }>>`
      SELECT u.name, u.id, COUNT(a.id) as application_count
      FROM users u
      JOIN positions p ON p.company_id = u.id
      JOIN applications a ON a.position_id = p.id
      WHERE u.role = 'company'
      GROUP BY u.id, u.name
      ORDER BY application_count DESC
      LIMIT 5
    `;

    // Get monthly applications for current year
    const monthlyApplicationsResult = await this.prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT TO_CHAR(applied_at, 'MM') as month, COUNT(*)::integer as count
      FROM applications
      WHERE applied_at >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY TO_CHAR(applied_at, 'MM')
      ORDER BY month
    `;

    // Get applications by status
    const applicationsByStatus = await this.prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Format monthly applications to include missing months
    const monthlyApplications = [];
    const monthMap: Record<string, string> = {
      '01': 'T1', '02': 'T2', '03': 'T3', '04': 'T4',
      '05': 'T5', '06': 'T6', '07': 'T7', '08': 'T8',
      '09': 'T9', '10': 'T10', '11': 'T11', '12': 'T12',
    };
    for (const m of monthlyApplicationsResult) {
      monthlyApplications.push({
        month: monthMap[m.month] || m.month,
        count: Number(m.count),
      });
    }

    // Calculate success rate (approved applications / total applications)
    const successRate = applications > 0 
      ? Math.round((approvedApplications / applications) * 100 * 10) / 10 
      : 0;

    return {
      success: true,
      data: {
        users: { 
          total: totalUsers, 
          students, 
          lecturers, 
          companies, 
          admins 
        },
        positions: {
          total: positions,
        },
        applications: { 
          total: applications,
          approved: approvedApplications,
          byStatus: applicationsByStatus.map(s => ({
            status: s.status,
            count: s._count.status,
          })),
        },
        studentsWithInternship: approvedApplications,
        successRate,
        topCompanies: topCompaniesResult.map((c) => ({
          name: c.name,
          id: c.id,
          count: Number(c.application_count),
        })),
        monthlyApplications,
      },
    };
  }
}
