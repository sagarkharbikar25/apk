import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiService } from './ai.service.js';
import { BadRequestException } from '@nestjs/common';
import { LookingFor, SkillLevel } from '@prisma/client';

describe('AiService', () => {
  let service: AiService;
  let mockPrisma: any;
  let mockRedis: any;
  let mockGemini: any;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      userSkill: {
        findMany: vi.fn(),
      },
      aiRecommendation: {
        create: vi.fn(),
      },
    };

    mockRedis = {
      getJson: vi.fn(),
      setJsonEx: vi.fn(),
      del: vi.fn(),
    };

    mockGemini = {
      analyzeProject: vi.fn(),
      getSkillGapSuggestions: vi.fn(),
      enrichCandidates: vi.fn(),
    };

    service = new AiService(mockPrisma, mockRedis, mockGemini);
  });

  describe('analyzeProject', () => {
    it('should throw BadRequestException on empty title or description', async () => {
      await expect(service.analyzeProject({ title: '', description: '' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.analyzeProject({ title: 'Title', description: '  ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call Gemini analyzeProject and return structured result', async () => {
      const mockResult = {
        skills: ['TypeScript', 'NestJS'],
        domain: 'Backend API',
        roles: ['Backend Engineer'],
        difficulty: 'Intermediate' as const,
        summary: 'A project summary',
      };
      mockGemini.analyzeProject.mockResolvedValue(mockResult);

      const result = await service.analyzeProject({
        title: 'Project Title',
        description: 'Project Description',
      });
      expect(result).toEqual(mockResult);
      expect(mockGemini.analyzeProject).toHaveBeenCalledWith(
        'Project Title',
        'Project Description',
      );
    });
  });

  describe('getSkillGap', () => {
    it('should throw BadRequestException if neither projectId nor targetSkills is provided', async () => {
      await expect(service.getSkillGap('u1', {})).rejects.toThrow(BadRequestException);
    });

    it('should accurately compute matching and missing skills and coverage percentage', async () => {
      mockPrisma.userSkill.findMany.mockResolvedValue([
        { skill: { name: 'React' } },
        { skill: { name: 'TypeScript' } },
      ]);
      mockGemini.getSkillGapSuggestions.mockResolvedValue(['Learn Docker']);

      const result = await service.getSkillGap('u1', {
        targetSkills: ['React', 'Docker'],
      });

      expect(result.matchingSkills).toEqual(['React']);
      expect(result.missingSkills).toEqual(['Docker']);
      expect(result.coveragePercentage).toBe(50);
      expect(result.learningSuggestions).toEqual(['Learn Docker']);
    });
  });

  describe('getRecommendations', () => {
    it('should return cached result on Redis hit without calling Prisma or Gemini', async () => {
      const cached = [{ userId: 'c1', score: 0.95 }];
      mockRedis.getJson.mockResolvedValue(cached);

      const result = await service.getRecommendations('u1', 'p1');
      expect(result).toEqual(cached);
      expect(mockPrisma.project.findFirst).not.toHaveBeenCalled();
      expect(mockGemini.enrichCandidates).not.toHaveBeenCalled();
    });

    it('should exclude existing project members and creator, and enforce score 0.0 - 1.0', async () => {
      mockRedis.getJson.mockResolvedValue(null);

      mockPrisma.project.findFirst.mockResolvedValue({
        id: 'p1',
        title: 'AI Platform',
        creatorId: 'creator-1',
        members: [{ userId: 'member-1' }],
        requirements: [
          { skillId: 's1', skill: { name: 'Flutter', category: 'Mobile' } },
          { skillId: 's2', skill: { name: 'Dart', category: 'Mobile' } },
        ],
      });

      const candidateUser = {
        id: 'candidate-1',
        isActive: true,
        profile: {
          displayName: 'Alice',
          avatarUrl: null,
          bio: 'Mobile Dev',
          college: 'MIT',
          lookingFor: LookingFor.project,
        },
        userSkills: [
          {
            skillId: 's1',
            level: SkillLevel.advanced,
            skill: { id: 's1', name: 'Flutter', category: 'Mobile' },
          },
        ],
        availability: { hoursWeek: 20 },
      };

      mockPrisma.user.findMany.mockResolvedValue([candidateUser]);
      mockGemini.enrichCandidates.mockResolvedValue([
        {
          candidateId: 'candidate-1',
          reasons: ['Flutter expert'],
          fitSummary: 'Alice is a great fit',
        },
      ]);
      mockPrisma.aiRecommendation.create.mockResolvedValue({});

      const result = await service.getRecommendations('creator-1', 'p1');

      // Verify members excluded in query
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.objectContaining({
              notIn: expect.arrayContaining(['creator-1', 'member-1']),
            }),
          }),
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0].score).toBeGreaterThanOrEqual(0.0);
      expect(result[0].score).toBeLessThanOrEqual(1.0);
      expect(result[0].reasons).toEqual(['Flutter expert']);
      expect(result[0].fitSummary).toBe('Alice is a great fit');
      expect(mockRedis.setJsonEx).toHaveBeenCalled();
    });
  });
});
