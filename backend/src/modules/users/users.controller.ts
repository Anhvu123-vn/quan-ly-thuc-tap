import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public endpoint - must come before /:id
  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (public)' })
  async getStats() {
    return this.usersService.getStats();
  }

  // Authenticated endpoints
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiBearerAuth()
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (admin only)' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.updateUser(id, dto);
  }

  @Get('students/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiBearerAuth()
  async getStudentProfile(@Request() req: any) {
    return this.usersService.getStudentProfile(req.user.sub);
  }

  @Get('students/:id/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student profile by ID' })
  @ApiBearerAuth()
  async getStudentProfileById(@Param('id') id: string) {
    return this.usersService.getStudentProfile(id);
  }

  @Put('students/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update student profile' })
  @ApiBearerAuth()
  async updateStudentProfile(@Body() dto: any, @Request() req: any) {
    return this.usersService.updateStudentProfile(req.user.sub, dto);
  }

  @Put('students/profile/user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update student user info (name, phone)' })
  @ApiBearerAuth()
  async updateStudentUserInfo(@Body() dto: any, @Request() req: any) {
    return this.usersService.updateUser(req.user.sub, dto);
  }

  // Company management endpoints (admin only)
  @Get('companies/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pending company registrations (admin only)' })
  @ApiBearerAuth()
  async getPendingCompanies(@Query() query: any) {
    return this.usersService.getPendingCompanies(query);
  }

  @Put('companies/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve a pending company (admin only)' })
  @ApiBearerAuth()
  async approveCompany(@Param('id') id: string) {
    return this.usersService.approveCompany(id);
  }

  @Put('companies/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject a pending company (admin only)' })
  @ApiBearerAuth()
  async rejectCompany(@Param('id') id: string) {
    return this.usersService.rejectCompany(id);
  }
}
