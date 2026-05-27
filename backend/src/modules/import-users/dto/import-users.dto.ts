import { IsString, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'student',
  LECTURER = 'lecturer',
  COMPANY = 'company',
  ADMIN = 'admin',
}

export class ImportUserRowDto {
  @ApiProperty({ description: 'Họ và tên', required: true })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Email (phải là email hợp lệ)', required: true })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Vai trò: student | lecturer | company | admin',
    required: true,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ description: 'Mật khẩu (tối thiểu 6 ký tự)', required: true })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Khoa / Phòng ban', required: false })
  @IsString()
  @IsOptional()
  department?: string;
}

export class ImportUsersDto {
  @ApiProperty({
    description: 'Mảng dữ liệu người dùng cần tạo (parse từ file Excel)',
    type: [ImportUserRowDto],
  })
  users!: ImportUserRowDto[];
}

export class ImportPreviewResultDto {
  validUsers: ImportUserRowDto[];
  errors: ImportRowError[];
  totalRows: number;
  validCount: number;
  errorCount: number;
}

export class ImportRowError {
  row: number;
  field?: string;
  message: string;
}

export class ImportResultDto {
  successCount: number;
  failedCount: number;
  assignedCount: number;
  failedRows: ImportRowError[];
  createdUsers: { id: string; name: string; email: string; role: string }[];
}
