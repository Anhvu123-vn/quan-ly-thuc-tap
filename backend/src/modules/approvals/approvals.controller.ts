import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Approvals')
@Controller('approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get approvals' })
  async findAll(@Query() query: any, @Request() req: any) {
    return this.approvalsService.findAll(query, req.user.sub, req.user.role);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get approval by ID' })
  async findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Put(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Review approval' })
  async review(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.approvalsService.review(id, dto, req.user.sub);
  }

  @Get('pending/my-approvals')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get my pending approvals' })
  async getMyPendingApprovals(@Request() req: any) {
    return this.approvalsService.getMyPendingApprovals(req.user.sub, req.user.role);
  }
}
