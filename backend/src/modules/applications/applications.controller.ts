import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Applications')
@Controller('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get applications' })
  async findAll(@Query() query: any, @Request() req: any) {
    return this.applicationsService.findAll(query, req.user.sub, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create application (student)' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.applicationsService.create(dto, req.user.sub);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.LECTURER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Update application status' })
  async updateStatus(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.applicationsService.updateStatus(id, dto, req.user.sub, req.user.role);
  }

  @Get('student/my-applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get my applications' })
  async getMyApplications(@Request() req: any) {
    return this.applicationsService.getMyApplications(req.user.sub);
  }

  @Get('company/applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get applications for my positions' })
  async getApplicationsForCompany(@Request() req: any) {
    return this.applicationsService.getApplicationsForCompany(req.user.sub);
  }

  @Get('lecturer/students-for-evaluation')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get students for lecturer evaluation' })
  async getStudentsForEvaluation(@Request() req: any) {
    return this.applicationsService.getStudentsForEvaluation();
  }
}
