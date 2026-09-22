import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillsService } from './skills.service.js';

describe('SkillsService', () => {
  let service: SkillsService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    mockPrisma = {
      skill: {
        findMany: vi.fn(),
      },
      userSkill: {
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    };

    mockRedis = {
      getJson: vi.fn(),
      setJsonEx: vi.fn(),
      del: vi.fn(),
    };

    service = new SkillsService(mockPrisma, mockRedis);
  });

  describe('getAll', () => {
    it('should return cached skills if present and no query filters', async () => {
      const cached = [{ id: '1', name: 'TypeScript', category: 'Backend' }];
      mockRedis.getJson.mockResolvedValue(cached);

      const result = await service.getAll({});
      expect(result).toEqual(cached);
      expect(mockRedis.getJson).toHaveBeenCalledWith('skills:all');
      expect(mockPrisma.skill.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when cache miss', async () => {
      mockRedis.getJson.mockResolvedValue(null);
      const dbSkills = [{ id: '1', name: 'TypeScript', category: 'Backend' }];
      mockPrisma.skill.findMany.mockResolvedValue(dbSkills);

      const result = await service.getAll({});
      expect(result).toEqual(dbSkills);
      expect(mockRedis.setJsonEx).toHaveBeenCalledWith('skills:all', 3600, dbSkills);
    });

    it('should bypass cache when filter is applied', async () => {
      const dbSkills = [{ id: '2', name: 'React', category: 'Frontend' }];
      mockPrisma.skill.findMany.mockResolvedValue(dbSkills);

      const result = await service.getAll({ category: 'Frontend' });
      expect(result).toEqual(dbSkills);
      expect(mockRedis.getJson).not.toHaveBeenCalled();
      expect(mockRedis.setJsonEx).not.toHaveBeenCalled();
    });
  });

  describe('addUserSkill', () => {
    it('should upsert user skill and invalidate profile + recommendations cache', async () => {
      const mockResult = { userId: 'u1', skillId: 's1', level: 'intermediate' };
      mockPrisma.userSkill.upsert.mockResolvedValue(mockResult);

      const result = await service.addUserSkill('u1', 's1', 'intermediate');
      expect(result).toEqual(mockResult);
      expect(mockPrisma.userSkill.upsert).toHaveBeenCalledWith({
        where: { userId_skillId: { userId: 'u1', skillId: 's1' } },
        update: { level: 'intermediate' },
        create: { userId: 'u1', skillId: 's1', level: 'intermediate' },
        include: { skill: true },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('profile:u1');
      expect(mockRedis.del).toHaveBeenCalledWith('recommendations:u1');
    });
  });

  describe('removeUserSkill', () => {
    it('should delete user skill and invalidate caches', async () => {
      mockPrisma.userSkill.delete.mockResolvedValue({ id: 'us1' });

      const result = await service.removeUserSkill('u1', 's1');
      expect(result).toEqual({ message: 'Skill removed successfully' });
      expect(mockPrisma.userSkill.delete).toHaveBeenCalledWith({
        where: { userId_skillId: { userId: 'u1', skillId: 's1' } },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('profile:u1');
      expect(mockRedis.del).toHaveBeenCalledWith('recommendations:u1');
    });
  });
});
