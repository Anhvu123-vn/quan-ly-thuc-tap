import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LecturerAssignmentService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  /**
   * Admin: Assign a lecturer to supervise a student for a specific batch
   */
  async assign(dto: {
    lecturerId: string;
    studentId: string;
    batchId?: string;
    notes?: string;
    maxStudents?: number;
  }, actorId: string) {
    // Validate lecturer exists and is a lecturer
    const lecturer = await this.prisma.user.findUnique({ where: { id: dto.lecturerId } });
    if (!lecturer || lecturer.role !== 'lecturer') {
      throw new BadRequestException('Người được phân công phải là giảng viên.');
    }

    // Validate student exists and is a student
    const student = await this.prisma.user.findUnique({ where: { id: dto.studentId } });
    if (!student || student.role !== 'student') {
      throw new BadRequestException('Sinh viên không hợp lệ.');
    }

    // Validate batch exists (if provided)
    let batch: any = null;
    if (dto.batchId) {
      batch = await this.prisma.internshipBatch.findUnique({ where: { id: dto.batchId } });
      if (!batch) throw new NotFoundException('Không tìm thấy đợt thực tập.');
    }

    // Check if student already assigned to this lecturer for this batch
    const existing = await this.prisma.lecturerAssignment.findFirst({
      where: { 
        studentId: dto.studentId,
        batchId: dto.batchId || null,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Sinh viên này đã được phân công giảng viên "${existing.lecturerId === dto.lecturerId ? lecturer.name : 'khác'}" cho đợt này.`,
      );
    }

    const assignment = await this.prisma.lecturerAssignment.create({
      data: {
        lecturerId: dto.lecturerId,
        studentId: dto.studentId,
        batchId: dto.batchId || null,
        notes: dto.notes,
        status: 'active',
        maxStudents: dto.maxStudents ?? 10,
      },
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        batch: { select: { id: true, name: true, semester: true, academicYear: true } },
      },
    });

    const batchLabel = batch ? ` cho đợt "${batch.name}"` : '';

    // Notify lecturer
    await this.prisma.notification.create({
      data: {
        userId: dto.lecturerId,
        type: 'info',
        title: 'Phân công hướng dẫn sinh viên mới',
        message: `Bạn được phân công hướng dẫn sinh viên "${student.name}"${batchLabel}.`,
        link: `/lecturer/students`,
      },
    });

    // Notify student
    await this.prisma.notification.create({
      data: {
        userId: dto.studentId,
        type: 'info',
        title: 'Được phân công giảng viên hướng dẫn',
        message: `Bạn được phân công giảng viên "${lecturer.name}" hướng dẫn${batchLabel}.`,
        link: `/student/profile`,
      },
    });

    // Log
    const actor = await this.prisma.user.findUnique({ where: { id: actorId }, select: { name: true } });
    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorName: actor?.name,
      actorRole: 'admin',
      subject: `Phân công GVHD: ${lecturer.name} → ${student.name}`,
      message: `Admin "${actor?.name}" đã phân công giảng viên "${lecturer.name}" hướng dẫn sinh viên "${student.name}"${batchLabel}.`,
      metadata: { assignmentId: assignment.id, lecturerId: dto.lecturerId, studentId: dto.studentId, batchId: dto.batchId },
    });

    return { success: true, data: assignment };
  }

  /**
   * Admin: Update assignment
   */
  async update(id: string, dto: { status?: string; notes?: string; lecturerId?: string }, actorId: string) {
    const assignment = await this.prisma.lecturerAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Không tìm thấy phân công.');

    const updated = await this.prisma.lecturerAssignment.update({
      where: { id },
      data: {
        ...(dto.status && {
          status: dto.status as any,
          completedAt: dto.status === 'completed' ? new Date() : undefined,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.lecturerId && { lecturerId: dto.lecturerId }),
      },
      include: {
        lecturer: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: updated };
  }

  /**
   * Admin: Get all assignments across all batches, with optional filters
   */
  async findAll(query: any) {
    const { page = 1, limit = 100, batchId, lecturerId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (lecturerId) where.lecturerId = lecturerId;
    if (query.status) where.status = query.status;

    const [assignments, total] = await Promise.all([
      this.prisma.lecturerAssignment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          lecturer: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          batch: { select: { id: true, name: true, semester: true, academicYear: true } },
        },
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.lecturerAssignment.count({ where }),
    ]);

    return {
      success: true,
      data: assignments,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Admin: Get all assignments for a batch
   */
  async findByBatch(batchId: string, query: any) {
    const { page = 1, limit = 50, lecturerId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { batchId };
    if (lecturerId) where.lecturerId = lecturerId;
    if (status) where.status = status;

    const [assignments, total] = await Promise.all([
      this.prisma.lecturerAssignment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          lecturer: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          batch: { select: { id: true, name: true, semester: true, academicYear: true } },
        },
        orderBy: { assignedAt: 'asc' },
      }),
      this.prisma.lecturerAssignment.count({ where }),
    ]);

    return {
      success: true,
      data: assignments,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Lecturer: Get my assignments for a batch
   */
  async findByLecturer(lecturerId: string, query: any) {
    const { batchId, status } = query;
    const where: any = { lecturerId };
    if (batchId) where.batchId = batchId;
    if (status) where.status = status;

    const assignments = await this.prisma.lecturerAssignment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        batch: { select: { id: true, name: true, semester: true, academicYear: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return { success: true, data: assignments };
  }

  /**
   * Lecturer: Get a specific student's assignment
   */
  async findByStudent(lecturerId: string, studentId: string) {
    const assignment = await this.prisma.lecturerAssignment.findFirst({
      where: { lecturerId, studentId, status: 'active' },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        batch: { select: { id: true, name: true, semester: true, academicYear: true } },
      },
    });
    return { success: true, data: assignment };
  }

  /**
   * Admin: Get unassigned students for a batch
   */
  async findUnassignedStudents(batchId: string) {
    // Get students who have department_approved applications in this batch
    // but don't have a lecturer assignment yet
    const assignedStudentIds = await this.prisma.lecturerAssignment.findMany({
      where: { batchId, status: 'active' },
      select: { studentId: true },
    });
    const assignedIds = assignedStudentIds.map((a) => a.studentId);

    const students = await this.prisma.application.findMany({
      where: {
        batchId,
        status: 'department_approved',
        ...(assignedIds.length > 0 ? { studentId: { notIn: assignedIds } } : {}),
      },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        position: { select: { title: true, company: { select: { name: true } } } },
      },
    });

    const unique = new Map();
    students.forEach((app) => {
      if (!unique.has(app.studentId)) {
        unique.set(app.studentId, {
          student: app.student,
          applicationId: app.id,
          positionTitle: app.position?.title,
          companyName: app.position?.company?.name,
        });
      }
    });

    return { success: true, data: Array.from(unique.values()) };
  }

  /**
   * Admin: Get all lecturers
   */
  async getAllLecturers() {
    const lecturers = await this.prisma.user.findMany({
      where: { role: 'lecturer', status: 'active' },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
      },
      orderBy: { name: 'asc' },
    });
    return lecturers;
  }

  /**
   * Admin: Get unassigned students (all or by batch)
   */
  async getUnassignedStudents(batchId?: string) {
    // Get all students with active lecturer assignments
    const assignedStudentIds = await this.prisma.lecturerAssignment.findMany({
      where: { status: 'active' },
      select: { studentId: true },
    });
    const assignedIds = assignedStudentIds.map((a) => a.studentId);

    // Build where clause
    const studentWhere: any = {
      role: 'student',
      status: 'active',
      ...(assignedIds.length > 0 ? { id: { notIn: assignedIds } } : {}),
    };

    let students;
    if (batchId) {
      // Filter by batch - students who have applications in this batch
      const studentsInBatch = await this.prisma.application.findMany({
        where: { batchId },
        select: { studentId: true },
      });
      const batchStudentIds = studentsInBatch.map((a) => a.studentId);
      students = await this.prisma.user.findMany({
        where: {
          ...studentWhere,
          id: { in: batchStudentIds },
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          phone: true,
        },
        orderBy: { name: 'asc' },
      });
    } else {
      students = await this.prisma.user.findMany({
        where: studentWhere,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          phone: true,
        },
        orderBy: { name: 'asc' },
      });
    }

    return { success: true, data: students };
  }

  /**
   * Admin: Preview auto-distribution
   */
  async previewDistribution(batchId?: string) {
    const lecturers = await this.getAllLecturers();
    if (lecturers.length === 0) {
      return {
        success: false,
        error: 'Không có giảng viên nào trong hệ thống',
      };
    }

    const unassignedResult = await this.getUnassignedStudents(batchId);
    const unassignedStudents = unassignedResult.data;

    if (unassignedStudents.length === 0) {
      return {
        success: true,
        unassignedCount: 0,
        distribution: lecturers.map((l) => ({ ...l, studentCount: 0, students: [] })),
        message: 'Tất cả sinh viên đã được phân công giảng viên',
      };
    }

    // Calculate distribution
    const distribution = lecturers.map((lecturer, index) => {
      const assignedStudents: typeof unassignedStudents = [];
      unassignedStudents.forEach((student, studentIndex) => {
        if (studentIndex % lecturers.length === index) {
          assignedStudents.push(student);
        }
      });
      return {
        ...lecturer,
        studentCount: assignedStudents.length,
        students: assignedStudents,
      };
    });

    return {
      success: true,
      unassignedCount: unassignedStudents.length,
      distribution,
    };
  }

  /**
   * Admin: Auto-distribute unassigned students to all lecturers evenly
   */
  async autoDistribute(batchId?: string, actorId?: string) {
    // Get all lecturers
    const lecturers = await this.getAllLecturers();
    if (lecturers.length === 0) {
      throw new BadRequestException(
        'Không có giảng viên nào trong hệ thống. Vui lòng tạo tài khoản giảng viên trước.',
      );
    }

    // Get unassigned students
    const unassignedResult = await this.getUnassignedStudents(batchId);
    const unassignedStudents = unassignedResult.data;

    if (unassignedStudents.length === 0) {
      return {
        success: true,
        assignedCount: 0,
        totalStudents: 0,
        totalLecturers: lecturers.length,
        distribution: [],
        message: 'Tất cả sinh viên đã được phân công giảng viên',
      };
    }

    // Distribute students evenly using round-robin
    let assignedCount = 0;
    const distribution: { lecturerId: string; lecturerName: string; count: number }[] = [];
    const studentsByLecturer = new Map<string, { name: string; students: string[] }>();

    for (let i = 0; i < unassignedStudents.length; i++) {
      const student = unassignedStudents[i];
      const lecturerIndex = i % lecturers.length;
      const lecturer = lecturers[lecturerIndex];

      try {
        await this.prisma.lecturerAssignment.create({
          data: {
            lecturerId: lecturer.id,
            studentId: student.id,
            batchId: batchId || null,
            status: 'active',
            maxStudents: 10,
            notes: 'Tự động phân đều từ chức năng phân công hàng loạt',
          },
        });

        assignedCount++;

        // Track distribution
        if (!studentsByLecturer.has(lecturer.id)) {
          studentsByLecturer.set(lecturer.id, { name: lecturer.name, students: [] });
        }
        studentsByLecturer.get(lecturer.id)!.students.push(student.name);
      } catch (err: any) {
        // Skip if already exists
        if (err.code !== 'P2002') {
          console.warn(`Failed to assign student ${student.id}:`, err.message);
        }
      }
    }

    // Build distribution summary
    studentsByLecturer.forEach((data, lecturerId) => {
      const lecturer = lecturers.find((l) => l.id === lecturerId);
      distribution.push({
        lecturerId,
        lecturerName: lecturer?.name || data.name,
        count: data.students.length,
      });
    });

    // Send notifications to lecturers
    await Promise.all(
      Array.from(studentsByLecturer.entries()).map(([lecturerId, data]) =>
        this.prisma.notification.create({
          data: {
            userId: lecturerId,
            type: 'info',
            title: 'Phân công hướng dẫn sinh viên mới',
            message: `${data.students.length} sinh viên mới (${data.students.slice(0, 3).join(', ')}${data.students.length > 3 ? '...' : ''}) được phân công cho bạn từ chức năng tự động phân đều.`,
            link: `/lecturer/students`,
          },
        }),
      ),
    );

    // Log the action
    if (actorId) {
      const actor = await this.prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true },
      });
      await this.logsService.logAction({
        logType: 'system',
        actorId,
        actorName: actor?.name,
        actorRole: 'admin',
        subject: `Tự động phân đều ${assignedCount} sinh viên cho giảng viên`,
        message: `Admin "${actor?.name}" đã tự động phân đều ${assignedCount} sinh viên cho ${lecturers.length} giảng viên.`,
        metadata: { assignedCount, distribution },
      });
    }

    return {
      success: true,
      assignedCount,
      totalStudents: unassignedStudents.length,
      totalLecturers: lecturers.length,
      distribution,
    };
  }
}
