import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import {
  ImportUserRowDto,
  ImportPreviewResultDto,
  ImportRowError,
  ImportResultDto,
} from './dto/import-users.dto';

@Injectable()
export class ImportUsersService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  /**
   * Validate a single row and return errors if any
   */
  private validateRow(
    row: any,
    rowIndex: number,
    seenEmails: Set<string>,
  ): { dto?: ImportUserRowDto; errors: ImportRowError[] } {
    const errors: ImportRowError[] = [];

    // Name validation
    const name = row['Họ và tên'] || row['name'] || row['Name'] || '';
    if (!name || String(name).trim().length < 2) {
      errors.push({
        row: rowIndex,
        field: 'name',
        message: 'Họ và tên bắt buộc, tối thiểu 2 ký tự',
      });
    }

    // Email validation
    const email = row['Email'] || row['email'] || row['Email'] || '';
    const emailStr = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr || !emailRegex.test(emailStr)) {
      errors.push({
        row: rowIndex,
        field: 'email',
        message: 'Email không hợp lệ',
      });
    } else if (seenEmails.has(emailStr)) {
      errors.push({
        row: rowIndex,
        field: 'email',
        message: 'Email bị trùng lặp trong file import',
      });
    } else {
      seenEmails.add(emailStr);
    }

    // Role validation
    const roleRaw = row['Vai trò'] || row['role'] || row['Role'] || '';
    const roleMap: Record<string, string> = {
      sinh_viên: 'student',
      'sinh viên': 'student',
      student: 'student',
      sv: 'student',
      giảng_viên: 'lecturer',
      'giảng viên': 'lecturer',
      lecturer: 'lecturer',
      gv: 'lecturer',
      doanh_nghiệp: 'company',
      'doanh nghiệp': 'company',
      company: 'company',
      dn: 'company',
      admin: 'admin',
      quản_trị: 'admin',
    };
    const role = roleMap[String(roleRaw).trim().toLowerCase()];
    if (!role) {
      errors.push({
        row: rowIndex,
        field: 'role',
        message:
          'Vai trò không hợp lệ. Chỉ chấp nhận: sinh viên, giảng viên, doanh nghiệp, admin',
      });
    }

    // Password validation
    const password = row['Mật khẩu'] || row['password'] || row['Password'] || '';
    const passwordStr = String(password).trim();
    if (!passwordStr || passwordStr.length < 6) {
      errors.push({
        row: rowIndex,
        field: 'password',
        message: 'Mật khẩu bắt buộc, tối thiểu 6 ký tự',
      });
    }

    if (errors.length > 0) {
      return { errors };
    }

    return {
      dto: {
        name: String(name).trim(),
        email: emailStr,
        role: role as any,
        password: passwordStr,
        phone: row['Điện thoại'] || row['phone'] || row['Phone'] || undefined,
        department:
          row['Khoa/Phòng'] ||
          row['department'] ||
          row['Department'] ||
          undefined,
      },
      errors: [],
    };
  }

  /**
   * Parse raw Excel sheet data into row objects
   */
  private parseSheetData(
    sheetData: any[],
  ): { headers: string[]; rows: Record<string, any>[] } {
    if (!sheetData || sheetData.length < 2) {
      return { headers: [], rows: [] };
    }
    const headers = sheetData[0];
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
        continue; // skip empty rows
      }
      const obj: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] ?? '';
      }
      rows.push(obj);
    }
    return { headers, rows };
  }

  /**
   * Validate all rows from parsed Excel data
   * Also checks for email duplicates in database
   */
  async previewImport(
    sheetData: any[],
  ): Promise<ImportPreviewResultDto> {
    const { rows } = this.parseSheetData(sheetData);
    const seenEmails = new Set<string>();
    const validUsers: ImportUserRowDto[] = [];
    const errors: ImportRowError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // Excel row number (1-indexed + header row)
      const { dto, errors: rowErrors } = this.validateRow(
        rows[i],
        rowIndex,
        seenEmails,
      );

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else if (dto) {
        validUsers.push(dto);
      }
    }

    // Check for existing emails in database
    if (validUsers.length > 0) {
      const emails = validUsers.map((u) => u.email);
      const existing = await this.prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      });
      for (const user of existing) {
        errors.push({
          row: 0, // row unknown in this context
          field: 'email',
          message: `Email "${user.email}" đã tồn tại trong hệ thống`,
        });
      }
      // Remove users with existing emails from valid list
      const existingEmails = new Set(existing.map((u) => u.email));
      const validFiltered = validUsers.filter(
        (u) => !existingEmails.has(u.email),
      );
      return {
        validUsers: validFiltered,
        errors,
        totalRows: rows.length,
        validCount: validFiltered.length,
        errorCount: errors.length,
      };
    }

    return {
      validUsers,
      errors,
      totalRows: rows.length,
      validCount: validUsers.length,
      errorCount: errors.length,
    };
  }

  /**
   * Execute bulk user creation from validated data.
   * Students are automatically assigned to lecturers evenly for the active batch.
   */
  async executeImport(
    users: ImportUserRowDto[],
    actorId: string,
    actorName: string,
    actorRole: string,
  ): Promise<ImportResultDto> {
    const createdUsers: { id: string; name: string; email: string; role: string }[] = [];
    const failedRows: ImportRowError[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        const existing = await this.prisma.user.findUnique({
          where: { email: user.email },
        });
        if (existing) {
          failedRows.push({
            row: i + 1,
            field: 'email',
            message: `Email "${user.email}" đã tồn tại`,
          });
          failedCount++;
          continue;
        }

        const passwordHash = await bcrypt.hash(user.password, 10);
        const created = await this.prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            passwordHash,
            role: user.role,
            phone: user.phone,
            department: user.department,
          },
          select: { id: true, name: true, email: true, role: true },
        });

        createdUsers.push(created);
        successCount++;
      } catch (err: any) {
        failedRows.push({
          row: i + 1,
          field: 'email',
          message: err.message || 'Lỗi không xác định khi tạo tài khoản',
        });
        failedCount++;
      }
    }

    // Auto-assign students to lecturers evenly
    let assignedCount = 0;
    const studentUsers = createdUsers.filter((u) => u.role === 'student');
    if (studentUsers.length > 0) {
      assignedCount = await this.autoAssignStudentsToLecturers(studentUsers, actorId);
    }

    // Log bulk import action
    await this.logsService.logAction({
      logType: 'system',
      actorId,
      actorName,
      actorRole,
      subject: `Import hàng loạt ${createdUsers.length} tài khoản`,
      message: `Admin "${actorName}" đã import hàng loạt ${createdUsers.length} tài khoản mới (${successCount} thành công, ${failedCount} thất bại). ${assignedCount} sinh viên đã được phân đều cho giảng viên.`,
      metadata: {
        successCount,
        failedCount,
        totalRows: users.length,
        createdEmails: createdUsers.map((u) => u.email),
        failedDetails: failedRows,
        assignedCount,
      },
    });

    return { successCount, failedCount, failedRows, createdUsers, assignedCount };
  }

  /**
   * Distribute students evenly to all lecturers (no batch required).
   * Creates LecturerAssignment records for each student.
   * @returns number of assignments created
   */
  private async autoAssignStudentsToLecturers(
    students: { id: string; name: string; email: string; role: string }[],
    actorId: string,
  ): Promise<number> {
    // Get all lecturers
    const lecturers = await this.prisma.user.findMany({
      where: { role: 'lecturer' },
      select: { id: true, name: true },
    });

    if (lecturers.length === 0) {
      throw new BadRequestException(
        `Không có giảng viên nào trong hệ thống. Vui lòng tạo tài khoản giảng viên trước khi import sinh viên.`,
      );
    }

    // Get students who already have assignments
    const existingAssignments = await this.prisma.lecturerAssignment.findMany({
      where: { studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true },
    });
    const assignedStudentIds = new Set(existingAssignments.map((a) => a.studentId));

    // Filter out already-assigned students
    const unassignedStudents = students.filter((s) => !assignedStudentIds.has(s.id));

    if (unassignedStudents.length === 0) {
      return 0; // All students already have assignments
    }

    // Distribute students round-robin: student[i] → lecturer[i % lecturerCount]
    // batchId is left null — assignment is global (no batch required)
    const assignments = unassignedStudents.map((student, index) => ({
      lecturerId: lecturers[index % lecturers.length].id,
      studentId: student.id,
      status: 'active' as const,
      notes: `Tự động phân công từ import.`,
    }));

    // Create assignments one by one to handle potential conflicts gracefully
    let created = 0;
    for (const assignment of assignments) {
      try {
        await this.prisma.lecturerAssignment.create({
          data: assignment as any,
        });
        created++;
      } catch (err: any) {
        // Skip if already exists (ignore conflict)
        if (err.code !== 'P2002' && err.code !== 'UniqueConstraintError') {
          console.warn(`Failed to create assignment for student ${assignment.studentId}:`, err.message);
        }
      }
    }

    // Notify each lecturer about their newly assigned students
    const studentsByLecturer = new Map<string, string[]>();
    for (const a of assignments) {
      const existing = studentsByLecturer.get(a.lecturerId) || [];
      const student = students.find((s) => s.id === a.studentId);
      if (student) existing.push(student.name);
      studentsByLecturer.set(a.lecturerId, existing);
    }

    await Promise.all(
      Array.from(studentsByLecturer.entries()).map(([lecturerId, names]) =>
        this.prisma.notification.create({
          data: {
            userId: lecturerId,
            type: 'info',
            title: 'Phân công hướng dẫn sinh viên mới',
            message: `${names.length} sinh viên mới (${names.slice(0, 3).join(', ')}${names.length > 3 ? '...' : ''}) được phân công cho bạn từ đợt import.`,
            link: `/lecturer/students`,
          },
        }),
      ),
    );

    return created;
  }
}
