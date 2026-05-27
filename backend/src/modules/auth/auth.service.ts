import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { RegisterDto, LoginDto, UserRole } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logsService: LogsService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // For companies, default status is pending until approved by admin
    const userStatus = dto.role === UserRole.COMPANY ? 'pending' : 'active';

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        department: dto.department,
        phone: dto.phone,
        status: userStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    // Log new user registration
    await this.logsService.logAction({
      logType: 'system',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      subject: `Đăng ký tài khoản mới: ${user.name}`,
      message: `Người dùng "${user.name}" (${user.role}) đã đăng ký tài khoản mới với email "${user.email}".`,
      metadata: { userId: user.id, role: user.role, department: user.department },
    });

    // Companies must be approved by admin before they can log in — do not issue tokens
    if (dto.role === UserRole.COMPANY) {
      return {
        success: true,
        data: {
          user,
          message: 'Đăng ký thành công. Tài khoản đang chờ phê duyệt bởi quản trị viên.',
        },
      };
    }

    // Generate tokens for non-company users (students, lecturers, admins)
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      success: true,
      data: {
        user,
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block login for pending companies (not yet approved)
    if (user.role === 'company' && user.status === 'pending') {
      throw new UnauthorizedException('Tài khoản của bạn chưa được phê duyệt. Vui lòng chờ quản trị viên kích hoạt.');
    }

    // Block login for rejected companies
    if (user.role === 'company' && user.status === 'rejected') {
      throw new UnauthorizedException('Tài khoản đã bị từ chối. Vui lòng liên hệ quản trị viên.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
        },
        ...tokens,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isValid = await this.verifyRefreshToken(user.id, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        data: tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      });
    } catch {
      // Ignore errors during logout
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      success: true,
      data: user,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  private async verifyRefreshToken(userId: string, token: string): Promise<boolean> {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    for (const stored of storedTokens) {
      if (await bcrypt.compare(token, stored.token)) {
        if (new Date() > stored.expiresAt) {
          await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
          });
          return false;
        }
        return true;
      }
    }

    return false;
  }
}
