import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from './admin.service.js';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      project: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      team: {
        count: vi.fn(),
      },
      hackathon: {
        create: vi.fn(),
        count: vi.fn(),
      },
      userSkill: {
        groupBy: vi.fn(),
      },
      skill: {
        findMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new AdminService(mockPrisma);
  });

  describe('getUsers', () => {
    it('should return paginated users and meta', async () => {
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', email: 'user1@test.com' },
        { id: 'u2', email: 'user2@test.com' },
      ]);

      const result = await service.getUsers({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('updateUserStatus', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateUserStatus('admin-1', 'u999', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update user status and record audit log', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: true });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updateUserStatus('admin-1', 'u1', false);
      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isActive: false },
        select: expect.any(Object),
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'admin-1',
          action: 'USER_DEACTIVATED',
          entityType: 'User',
          entityId: 'u1',
          metadata: { previousState: true, newState: false },
        },
      });
    });
  });

  describe('getProjects', () => {
    it('should return paginated projects and meta', async () => {
      mockPrisma.project.count.mockResolvedValue(1);
      mockPrisma.project.findMany.mockResolvedValue([{ id: 'p1', title: 'Project 1' }]);

      const result = await service.getProjects({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createHackathon', () => {
    it('should create a hackathon record', async () => {
      const mockHackathon = { id: 'h1', title: 'AI Cup 2026' };
      mockPrisma.hackathon.create.mockResolvedValue(mockHackathon);

      const result = await service.createHackathon('admin-1', {
        title: 'AI Cup 2026',
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2026-10-03T00:00:00Z',
        registrationDeadline: '2026-09-28T00:00:00Z',
        maxTeamSize: 4,
      });

      expect(result).toEqual(mockHackathon);
      expect(mockPrisma.hackathon.create).toHaveBeenCalled();
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return platform totals and top skill distribution', async () => {
      mockPrisma.user.count.mockResolvedValueOnce(100).mockResolvedValueOnce(90);
      mockPrisma.team.count.mockResolvedValue(25);
      mockPrisma.project.count.mockResolvedValue(40);
      mockPrisma.hackathon.count.mockResolvedValue(3);
      mockPrisma.userSkill.groupBy.mockResolvedValue([
        { skillId: 's1', _count: { skillId: 15 } },
      ]);
      mockPrisma.skill.findMany.mockResolvedValue([{ id: 's1', name: 'TypeScript' }]);

      const result = await service.getAnalyticsSummary();
      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(90);
      expect(result.totalTeams).toBe(25);
      expect(result.totalProjects).toBe(40);
      expect(result.activeHackathons).toBe(3);
      expect(result.skillDistribution).toEqual([
        { skillId: 's1', skillName: 'TypeScript', userCount: 15 },
      ]);
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      mockPrisma.auditLog.count.mockResolvedValue(1);
      mockPrisma.auditLog.findMany.mockResolvedValue([
        { id: 'a1', action: 'USER_DEACTIVATED' },
      ]);

      const result = await service.getAuditLogs({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
