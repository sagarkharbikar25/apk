import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service.js';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      profile: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    mockRedis = {
      getJson: vi.fn(),
      setJsonEx: vi.fn(),
      del: vi.fn(),
    };

    service = new UsersService(mockPrisma, mockRedis);
  });

  describe('getMe', () => {
    it('should return user with profile, skills, and availability', async () => {
      const mockUser = {
        id: 'u1',
        email: 'user@example.com',
        profile: { displayName: 'John' },
        userSkills: [],
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('u1');
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: expect.any(Object),
      });
    });
  });

  describe('updateMe', () => {
    it('should update profile and invalidate profile + recommendations cache', async () => {
      const dto = { bio: 'Fullstack Dev', college: 'Tech University' };
      mockPrisma.profile.update.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com' });

      await service.updateMe('u1', dto);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: dto,
      });
      expect(mockRedis.del).toHaveBeenCalledWith('profile:u1');
      expect(mockRedis.del).toHaveBeenCalledWith('recommendations:u1');
    });
  });

  describe('getPublicProfile', () => {
    it('should return cached profile on cache hit', async () => {
      const cached = { displayName: 'John', bio: 'Dev' };
      mockRedis.getJson.mockResolvedValue(cached);

      const result = await service.getPublicProfile('u1');
      expect(result).toEqual(cached);
      expect(mockRedis.getJson).toHaveBeenCalledWith('profile:u1');
      expect(mockPrisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it('should query DB and cache when cache miss', async () => {
      mockRedis.getJson.mockResolvedValue(null);
      const dbProfile = { id: 'p1', userId: 'u1', displayName: 'John' };
      mockPrisma.profile.findUnique.mockResolvedValue(dbProfile);

      const result = await service.getPublicProfile('u1');
      expect(result).toEqual(dbProfile);
      expect(mockRedis.setJsonEx).toHaveBeenCalledWith('profile:u1', 300, dbProfile);
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockRedis.getJson.mockResolvedValue(null);
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.getPublicProfile('u999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveFcmToken', () => {
    it('should update fcmToken for the user', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.saveFcmToken('u1', 'token-xyz');
      expect(result).toEqual({ message: 'FCM token registered' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { fcmToken: 'token-xyz' },
      });
    });
  });
});
