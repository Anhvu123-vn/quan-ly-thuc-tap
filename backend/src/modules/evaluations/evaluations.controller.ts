import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Evaluations')
@Controller('evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get evaluations' })
  async findAll(@Query() query: any, @Request() req: any) {
    return this.evaluationsService.findAll(query, req.user.sub, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation by ID' })
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.COMPANY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create evaluation' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.evaluationsService.create(dto, req.user.sub);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update evaluation' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.evaluationsService.update(id, dto, req.user.sub);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get evaluations for student' })
  async getForStudent(@Param('studentId') studentId: string) {
    return this.evaluationsService.getForStudent(studentId);
  }

  @Get('evaluator/my-evaluations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.COMPANY)
  @ApiOperation({ summary: 'Get my evaluations' })
  async getMyEvaluations(@Request() req: any) {
    return this.evaluationsService.getMyEvaluations(req.user.sub);
  }
}
