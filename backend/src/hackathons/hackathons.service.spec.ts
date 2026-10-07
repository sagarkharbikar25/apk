import { vi } from 'vitest';
import { HackathonsService } from './hackathons.service.js';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('HackathonsService', () => {
  let service: HackathonsService;
  let mockPrisma: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockNotifications = {
      sendToUsers: vi.fn(),
      sendHackathonAnnouncement: vi.fn(),
    };

    mockPrisma = {
      hackathon: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
      },
      hackathonRegistration: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      team: {
        findUnique: vi.fn(),
      },
    };

    service = new HackathonsService(mockPrisma, mockNotifications);
  });

  describe('findAll', () => {
    it('should return paginated hackathons and meta', async () => {
      mockPrisma.hackathon.count.mockResolvedValue(1);
      mockPrisma.hackathon.findMany.mockResolvedValue([{ id: 'h1', title: 'AI Hack' }]);

      const result = await service.findAll({ page: 1, limit: 10, active: true });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return hackathon if found', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({ id: 'h1', title: 'AI Hack' });
      const result = await service.findOne('h1');
      expect(result.title).toBe('AI Hack');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue(null);
      await expect(service.findOne('h999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('register', () => {
    const validHackathon = {
      id: 'h1',
      isActive: true,
      registrationDeadline: new Date(Date.now() + 100000),
      maxTeamSize: 4,
    };

    it('should successfully register an individual participant', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue(validHackathon);
      mockPrisma.hackathonRegistration.findUnique.mockResolvedValue(null);
      mockPrisma.hackathonRegistration.create.mockResolvedValue({
        id: 'hp1',
        hackathonId: 'h1',
        userId: 'u1',
      });

      const result = await service.register('u1', 'h1', {});
      expect(result.id).toBe('hp1');
      expect(mockPrisma.hackathonRegistration.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if hackathon is not active', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        ...validHackathon,
        isActive: false,
      });

      await expect(service.register('u1', 'h1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue({
        ...validHackathon,
        registrationDeadline: new Date(Date.now() - 10000),
      });

      await expect(service.register('u1', 'h1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user is already registered', async () => {
      mockPrisma.hackathon.findUnique.mockResolvedValue(validHackathon);
      mockPrisma.hackathonRegistration.findUnique.mockResolvedValue({ id: 'hp1' });

      await expect(service.register('u1', 'h1', {})).rejects.toThrow(ConflictException);
    });
  });
});

