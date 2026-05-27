import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { ImportUsersService } from './import-users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';

@ApiTags('Import Users')
@Controller('import-users')
export class ImportUsersController {
  constructor(private readonly importUsersService: ImportUsersService) {}

  /**
   * Preview / validate Excel file before import
   * Accepts base64-encoded file or raw sheet data
   */
  @Post('preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Preview & validate import file (admin only)' })
  @ApiBearerAuth()
  async previewImport(
    @Body() body: { sheetData?: any[][]; fileBase64?: string },
    @Request() req: any,
  ) {
    let sheetData: any[][] = [];

    if (body.fileBase64) {
      try {
        const buffer = Buffer.from(body.fileBase64, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheetData = raw as any[][];
      } catch {
        throw new BadRequestException(
          'Không thể đọc file Excel. Đảm bảo file đúng định dạng (.xlsx, .xls, .csv)',
        );
      }
    } else if (body.sheetData) {
      sheetData = body.sheetData;
    } else {
      throw new BadRequestException(
        'Vui lòng gửi file Excel (fileBase64) hoặc dữ liệu sheet (sheetData)',
      );
    }

    const result = await this.importUsersService.previewImport(sheetData);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Execute the actual bulk import with validated data
   */
  @Post('execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Execute bulk user import (admin only)' })
  @ApiBearerAuth()
  async executeImport(
    @Body() body: { users: any[]; sheetData?: any[][]; fileBase64?: string },
    @Request() req: any,
  ) {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException('Không xác thực được người dùng');
    }

    let users = body.users;

    // If users not provided directly, parse from file
    if ((!users || users.length === 0) && body.fileBase64) {
      try {
        const buffer = Buffer.from(body.fileBase64, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const sheetData = raw as any[][];
        const preview = await this.importUsersService.previewImport(sheetData);
        users = preview.validUsers;
      } catch {
        throw new BadRequestException(
          'Không thể đọc file Excel. Đảm bảo file đúng định dạng (.xlsx, .xls, .csv)',
        );
      }
    }

    if (!users || users.length === 0) {
      throw new BadRequestException(
        'Không có dữ liệu người dùng hợp lệ để import',
      );
    }

    const result = await this.importUsersService.executeImport(
      users,
      req.user.sub,
      req.user.email || 'admin',
      req.user.role || 'admin',
    );

    return {
      success: true,
      data: result,
    };
  }
}
