import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LecturerAssignmentService } from './lecturer-assignment.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Lecturer Assignments')
@Controller('lecturer-assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LecturerAssignmentController {
  constructor(private readonly lecturerAssignmentService: LecturerAssignmentService) {}

  /**
   * Admin: Get all assignments
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all lecturer assignments' })
  findAll(@Query() query: any) {
    return this.lecturerAssignmentService.findAll(query);
  }

  /**
   * Admin: Get all assignments for a batch
   */
  @Get('batch/:batchId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all lecturer assignments for a batch' })
  findByBatch(@Param('batchId') batchId: string, @Query() query: any) {
    return this.lecturerAssignmentService.findByBatch(batchId, query);
  }

  /**
   * Admin: Get unassigned students for a batch
   */
  @Get('batch/:batchId/unassigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get students without lecturer assignment for a batch' })
  findUnassignedStudents(@Param('batchId') batchId: string) {
    return this.lecturerAssignmentService.findUnassignedStudents(batchId);
  }

  /**
   * Admin: Assign a lecturer to a student
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign a lecturer to supervise a student' })
  assign(@Body() dto: { lecturerId: string; studentId: string; batchId?: string; notes?: string; maxStudents?: number }, @Request() req: any) {
    return this.lecturerAssignmentService.assign(dto, req.user.sub);
  }

  /**
   * Admin: Update an assignment
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update lecturer assignment' })
  update(@Param('id') id: string, @Body() dto: { status?: string; notes?: string; lecturerId?: string }, @Request() req: any) {
    return this.lecturerAssignmentService.update(id, dto, req.user.sub);
  }

  /**
   * Admin: Delete an assignment
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete lecturer assignment' })
  async delete(@Param('id') id: string) {
    await this.lecturerAssignmentService.update(id, { status: 'cancelled' }, '');
    return { success: true, message: 'Đã xóa phân công' };
  }

  /**
   * Lecturer: Get my assignments
   */
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  @ApiOperation({ summary: 'Get my lecturer assignments' })
  findMyAssignments(@Request() req: any, @Query() query: any) {
    return this.lecturerAssignmentService.findByLecturer(req.user.sub, query);
  }

  /**
   * Lecturer: Get a specific student's assignment
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  @ApiOperation({ summary: 'Get my assignment for a specific student' })
  findByStudent(@Request() req: any, @Param('studentId') studentId: string) {
    return this.lecturerAssignmentService.findByStudent(req.user.sub, studentId);
  }

  /**
   * Admin: Auto-distribute unassigned students to all lecturers evenly
   */
  @Post('auto-distribute')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Auto-distribute unassigned students to lecturers evenly' })
  autoDistribute(@Body() body: { batchId?: string }, @Request() req: any) {
    return this.lecturerAssignmentService.autoDistribute(body.batchId, req.user.sub);
  }

  /**
   * Admin: Preview auto-distribution (show what will be assigned)
   */
  @Get('preview-distribution')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Preview auto-distribution before executing' })
  previewDistribution(@Query('batchId') batchId?: string) {
    return this.lecturerAssignmentService.previewDistribution(batchId);
  }

  /**
   * Admin: Get all lecturers for assignment dropdown
   */
  @Get('lecturers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all lecturers for assignment' })
  async getAllLecturers() {
    const lecturers = await this.lecturerAssignmentService.getAllLecturers();
    return { success: true, data: lecturers };
  }

  /**
   * Admin: Get all students without lecturer assignment
   */
  @Get('unassigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all students without lecturer assignment' })
  getUnassignedStudents(@Query('batchId') batchId?: string) {
    return this.lecturerAssignmentService.getUnassignedStudents(batchId);
  }
}
