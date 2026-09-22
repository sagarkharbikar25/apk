import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiService } from './gemini.service.js';
import { ConfigService } from '@nestjs/config';

describe('GeminiService', () => {
  let service: GeminiService;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue('mock-api-key'),
    };
    service = new GeminiService(mockConfigService as ConfigService);
  });

  describe('analyzeProject fallback', () => {
    it('should return valid structured fallback when model is not initialized or fails', async () => {
      const result = await service.analyzeProject('Test Title', 'Test Description');
      expect(result).toHaveProperty('skills');
      expect(Array.isArray(result.skills)).toBe(true);
      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('summary');
    });
  });

  describe('getSkillGapSuggestions fallback', () => {
    it('should return 100% match message when no missing skills', async () => {
      const result = await service.getSkillGapSuggestions([], ['React']);
      expect(result).toEqual(['You meet 100% of the required skills for this project!']);
    });

    it('should return actionable suggestions for missing skills', async () => {
      const result = await service.getSkillGapSuggestions(['Docker', 'GraphQL'], ['React']);
      expect(result).toHaveLength(2);
      expect(result[0]).toContain('Docker');
    });
  });

  describe('enrichCandidates fallback', () => {
    it('should return enriched candidate structure', async () => {
      const candidates = [
        {
          userId: 'u1',
          displayName: 'Jane Doe',
          matchedSkills: ['React', 'TypeScript'],
          score: 0.85,
        },
      ];

      const result = await service.enrichCandidates('Web App', candidates);
      expect(result).toHaveLength(1);
      expect(result[0].candidateId).toBe('u1');
      expect(result[0].reasons.length).toBeGreaterThan(0);
      expect(result[0].fitSummary).toContain('Jane Doe');
    });
  });
});
