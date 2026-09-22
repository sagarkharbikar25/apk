import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ── Mock Factories ─────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
};

const mockJwt = {
  sign: vi.fn().mockReturnValue('mock.access.token'),
};

const mockConfig = {
  get: vi.fn().mockImplementation((key: string, fallback?: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
    };
    return map[key] ?? fallback;
  }),
};

const mockRedis = {
  get: vi.fn(),
  setEx: vi.fn(),
  del: vi.fn(),
};

// ── Tests ──────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ─────────────────────────────────────────────────
  describe('register()', () => {
    it('should create a user with a bcrypt-hashed password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // email not taken
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@college.edu',
        role: 'student',
      });
      mockRedis.setEx.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'test@college.edu',
        password: 'SecurePass1',
        displayName: 'Test User',
      });

      expect(result.message).toContain('Registration successful');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);

      // Verify bcrypt hash was created (not plain text)
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      const hash = createCall.data.passwordHash;
      expect(hash).not.toBe('SecurePass1');
      expect(await bcrypt.compare('SecurePass1', hash)).toBe(true);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'taken@college.edu',
          password: 'SecurePass1',
          displayName: 'Someone',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── login ─────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('SecurePass1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@college.edu',
        passwordHash: hash,
        role: 'student',
        isActive: true,
        emailVerified: true,
        deletedAt: null,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@college.edu',
        password: 'SecurePass1',
      });

      expect(result.accessToken).toBe('mock.access.token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@college.edu');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('RightPass1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@college.edu',
        passwordHash: hash,
        role: 'student',
        isActive: true,
        deletedAt: null,
      });

      await expect(
        service.login({ email: 'test@college.edu', password: 'WrongPass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@college.edu', password: 'SecurePass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── refresh ───────────────────────────────────────────────────
  describe('refresh()', () => {
    it('should rotate tokens and revoke the old refresh token', async () => {
      const rawToken = 'some-uuid-refresh-token';
      const crypto = require('crypto');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        tokenHash,
        revoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        user: { id: 'user-1', role: 'student', isActive: true, deletedAt: null },
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // old token was revoked
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revoked: true } }),
      );
    });

    it('should throw UnauthorizedException for revoked token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revoked: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { isActive: true, deletedAt: null },
      });

      await expect(service.refresh('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revoked: false,
        expiresAt: new Date(Date.now() - 60000), // expired
        user: { isActive: true, deletedAt: null },
      });

      await expect(service.refresh('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── verifyEmail ───────────────────────────────────────────────
  describe('verifyEmail()', () => {
    it('should verify email when OTP matches', async () => {
      mockRedis.get.mockResolvedValue('123456');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        emailVerified: false,
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.verifyEmail('test@college.edu', '123456');
      expect(result.message).toContain('verified');
    });

    it('should throw BadRequestException on wrong OTP', async () => {
      mockRedis.get.mockResolvedValue('123456');

      const { BadRequestException } = await import('@nestjs/common');
      await expect(
        service.verifyEmail('test@college.edu', '999999'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
