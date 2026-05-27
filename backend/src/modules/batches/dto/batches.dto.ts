import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum BatchStatusEnum {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export class CreateBatchDto {
  @ApiProperty({ example: 'Thực tập HK1 2025-2026' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Đợt thực tập chính thức cho sinh viên năm 3' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'HK1' })
  @IsString()
  semester!: string;

  @ApiProperty({ example: '2025-2026' })
  @IsString()
  academicYear!: string;

  @ApiPropertyOptional({ example: '2025-12-15' })
  @IsDateString()
  @IsOptional()
  applicationDeadline?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxStudents?: number;
}

export class UpdateBatchDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxStudents?: number;

  @ApiPropertyOptional({ enum: BatchStatusEnum })
  @IsEnum(BatchStatusEnum)
  @IsOptional()
  status?: BatchStatusEnum;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowCompanyPosting?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowStudentApplication?: boolean;
}

export class ActivateBatchDto {
  @ApiProperty({ description: 'Bật/tắt cho phép doanh nghiệp đăng tin' })
  @IsBoolean()
  allowCompanyPosting!: boolean;

  @ApiProperty({ description: 'Bật/tắt cho phép sinh viên nộp đơn' })
  @IsBoolean()
  allowStudentApplication!: boolean;
}
