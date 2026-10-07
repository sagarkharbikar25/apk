import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Role } from '@prisma/client';

const BCRYPT_SALT_ROUNDS = 12;
const OTP_TTL_SECONDS = 600; // 10 minutes
const REFRESH_TTL_DAYS = 7;

function generateOtp(): string {
  // crypto.randomInt is CSPRNG — Math.random() is NOT safe for OTPs
  return crypto.randomInt(100000, 999999).toString();
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  // ── Register ─────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    if (dto.role === 'organizer') {
      const validCode = this.configService.get<string>('ORGANIZER_INVITE_CODE') || 'SKILLSYNC_ORG_2026';
      if (dto.organizerCode !== validCode) {
        throw new ForbiddenException('Invalid organizer invite code');
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const assignedRole = (dto.role === 'organizer' ? Role.organizer : Role.student);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: assignedRole,
        profile: {
          create: {
            displayName: dto.displayName,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    // Store OTP in Redis for email verification
    const otp = generateOtp();
    await this.redis.setEx(`otp:${dto.email}`, OTP_TTL_SECONDS, otp);

    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    // Never log OTP in production — enumeration / data leak risk
    if (isDev) {
      this.logger.debug(`[DEV ONLY] OTP for ${dto.email}: ${otp}`);
    }

    return {
      message: 'Registration successful. Check your email for the OTP.',
      userId: user.id,
      // Never return OTP in prod — only for local dev convenience
      ...(isDev && { otp }),
    };
  }

  // ── Login ─────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  // ── Refresh ───────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, role: true, isActive: true, deletedAt: true } } },
    });

    // Reuse detection: if token exists but was already revoked, revoke ALL user tokens
    if (stored && stored.revoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
    }

    if (!stored || new Date() > stored.expiresAt) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    if (!stored.user.isActive || stored.user.deletedAt) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.generateTokenPair(stored.user.id, stored.user.role);
  }

  // ── Logout ────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (stored) {
      await this.prisma.user.update({
        where: { id: stored.userId },
        data: { fcmToken: null },
      });
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, revoked: false },
        data: { revoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  // ── Verify Email ──────────────────────────────────────────────
  async verifyEmail(email: string, otp: string) {
    const storedOtp = await this.redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    await this.redis.del(`otp:${email}`);

    return { message: 'Email verified successfully' };
  }

  // ── Resend Verification ───────────────────────────────────────
  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return same message — prevents user enumeration attacks
    if (!user || user.emailVerified) {
      return { message: 'If this email is registered and unverified, a new OTP has been sent.' };
    }

    // Rate-limit: if OTP already exists in Redis, block resend to prevent flooding
    const existing = await this.redis.get(`otp:${email}`);
    if (existing) {
      throw new BadRequestException('Please wait before requesting a new OTP.');
    }

    const otp = generateOtp();
    await this.redis.setEx(`otp:${email}`, OTP_TTL_SECONDS, otp);

    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
    if (isDev) {
      this.logger.debug(`[DEV ONLY] Resend OTP for ${email}: ${otp}`);
    }

    return { message: 'If this email is registered and unverified, a new OTP has been sent.' };
  }

  // ── Private: Generate Token Pair ─────────────────────────────
  private async generateTokenPair(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    } as any);

    const rawRefreshToken = uuidv4();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
