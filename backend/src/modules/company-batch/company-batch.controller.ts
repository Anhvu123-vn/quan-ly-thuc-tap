import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyBatchService } from './company-batch.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Company Batch')
@Controller('company-batches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompanyBatchController {
  constructor(private readonly companyBatchService: CompanyBatchService) {}

  /**
   * Admin: Get all pending company-batch approval requests
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all pending company-batch approval requests' })
  findAllPending(@Query() query: any) {
    return this.companyBatchService.findAllPending(query);
  }

  /**
   * Admin: Get company-batch approvals for a specific batch
   */
  @Get('batch/:batchId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get company-batch approvals for a batch' })
  findByBatch(@Param('batchId') batchId: string, @Query() query: any) {
    return this.companyBatchService.findByBatch(batchId, query);
  }

  /**
   * Company: Get my batch approvals
   */
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get my company batch approvals' })
  getMyCompanyBatches(@Request() req: any) {
    return this.companyBatchService.getMyCompanyBatches(req.user.sub);
  }

  /**
   * Company: Register to join a batch (or admin registers on behalf)
   */
  @Post('register')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Register company to participate in a batch' })
  registerForBatch(
    @Body() dto: { batchId: string; maxStudents?: number },
    @Request() req: any,
  ) {
    const companyId = dto.batchId ? req.user.sub : req.body.companyId || req.user.sub;
    return this.companyBatchService.registerCompanyForBatch(req.user.sub, dto.batchId, dto);
  }

  /**
   * Admin: Approve or reject a company for a batch
   */
  @Put(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a company for a batch' })
  review(
    @Param('id') id: string,
    @Body() dto: { status: 'approved' | 'rejected'; rejectionReason?: string; maxStudents?: number },
    @Request() req: any,
  ) {
    return this.companyBatchService.review(id, dto, req.user.sub);
  }
}
