import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { CreateBatchDto, UpdateBatchDto, ActivateBatchDto } from './dto/batches.dto';

@ApiTags('Internship Batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get batch statistics' })
  async getStats() {
    return this.batchesService.getStats();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active batch (for posting/apply checks)' })
  async getActiveBatch() {
    return this.batchesService.getActiveBatch();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming batches' })
  async getUpcomingBatches() {
    return this.batchesService.getUpcomingBatches();
  }

  @Get()
  @ApiOperation({ summary: 'Get all batches (public)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(@Query() query: any) {
    return this.batchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new internship batch (admin only)' })
  @ApiBearerAuth()
  async create(@Body() dto: CreateBatchDto, @Request() req: any) {
    return this.batchesService.create(dto, req.user.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update batch (admin only)' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdateBatchDto, @Request() req: any) {
    return this.batchesService.update(id, dto, req.user.sub);
  }

  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate batch (admin only) — enables posting/apply' })
  @ApiBearerAuth()
  async activate(@Param('id') id: string, @Body() dto: ActivateBatchDto, @Request() req: any) {
    return this.batchesService.activate(id, dto, req.user.sub);
  }

  @Put(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Close batch (admin only)' })
  @ApiBearerAuth()
  async close(@Param('id') id: string, @Request() req: any) {
    return this.batchesService.close(id, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete batch (admin only, upcoming only)' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.batchesService.delete(id, req.user.sub);
  }

  @Get('check/company-post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if company can post a new position' })
  @ApiBearerAuth()
  async canCompanyPost() {
    return this.batchesService.canCompanyPost();
  }

  @Get('check/student-apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if student can apply' })
  @ApiBearerAuth()
  async canStudentApply() {
    return this.batchesService.canStudentApply();
  }
}
