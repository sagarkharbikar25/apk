import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { GeminiService } from './gemini.service.js';
import { AnalyzeProjectDto, SkillGapDto } from './dto/ai.dto.js';
import { SkillLevel, LookingFor } from '@prisma/client';

const RECOMMENDATIONS_CACHE_TTL = 1800; // 30 minutes

const SKILL_LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  [SkillLevel.beginner]: 0.25,
  [SkillLevel.intermediate]: 0.5,
  [SkillLevel.advanced]: 0.75,
  [SkillLevel.expert]: 1.0,
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private gemini: GeminiService,
  ) {}

  // ── POST /ai/analyze-project ─────────────────────────────────
  async analyzeProject(dto: AnalyzeProjectDto) {
    if (!dto.title?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('Project title and description are required');
    }

    return this.gemini.analyzeProject(dto.title, dto.description);
  }

  // ── POST /ai/skill-gap ───────────────────────────────────────
  async getSkillGap(userId: string, dto: SkillGapDto) {
    let targetSkillNames: string[] = [];

    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, deletedAt: null },
        include: {
          requirements: { include: { skill: true } },
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
      }

      targetSkillNames = project.requirements.map((r) => r.skill.name);
    } else if (dto.targetSkills && dto.targetSkills.length > 0) {
      targetSkillNames = dto.targetSkills;
    } else {
      throw new BadRequestException('Either projectId or targetSkills must be provided');
    }

    // Fetch user's current skills
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const userSkillNames = new Set(
      userSkills.map((us) => us.skill.name.toLowerCase().trim()),
    );

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const target of targetSkillNames) {
      if (userSkillNames.has(target.toLowerCase().trim())) {
        matchingSkills.push(target);
      } else {
        missingSkills.push(target);
      }
    }

    const totalTargets = targetSkillNames.length;
    const coveragePercentage =
      totalTargets > 0 ? Math.round((matchingSkills.length / totalTargets) * 100) : 100;

    const learningSuggestions = await this.gemini.getSkillGapSuggestions(
      missingSkills,
      matchingSkills,
    );

    return {
      totalRequiredSkills: totalTargets,
      matchingSkills,
      missingSkills,
      coveragePercentage,
      learningSuggestions,
    };
  }

  // ── GET /recommendations ────────────────────────────────────
  async getRecommendations(userId: string, projectId?: string) {
    const cacheKey = `recommendations:${userId}:${projectId || 'general'}`;

    // 1. Cache-first check
    const cached = await this.redis.getJson<any[]>(cacheKey);
    if (cached) {
      this.logger.log(`Serving recommendations from Redis cache for key: ${cacheKey}`);
      return cached;
    }

    // If projectId is provided, recommend candidate teammates for that project
    if (projectId) {
      return this.recommendCandidatesForProject(userId, projectId, cacheKey);
    }

    // Otherwise recommend projects for the current user
    return this.recommendProjectsForUser(userId, cacheKey);
  }

  /**
   * Deterministic matching algorithm for candidate teammates for a project
   */
  private async recommendCandidatesForProject(
    userId: string,
    projectId: string,
    cacheKey: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: {
        requirements: { include: { skill: true } },
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Exclude creator and existing project members
    const existingMemberIds = new Set(project.members.map((m) => m.userId));
    existingMemberIds.add(project.creatorId);
    existingMemberIds.add(userId);

    // Step 1: SQL filter — exclude members, exclude lookingFor = not_looking
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(existingMemberIds) },
        isActive: true,
        deletedAt: null,
        profile: {
          lookingFor: { not: LookingFor.not_looking },
        },
      },
      include: {
        profile: true,
        userSkills: { include: { skill: true } },
        availability: true,
      },
      take: 50,
    });

    const projectSkillIds = new Set(project.requirements.map((r) => r.skillId));
    const projectSkillNames = new Set(
      project.requirements.map((r) => r.skill.name.toLowerCase().trim()),
    );

    // Step 2: Deterministic scoring (5 weighted components)
    const scoredCandidates = candidates
      .map((candidate) => {
        // 1. Skill Coverage (40%)
        let matchedCount = 0;
        let skillLevelSum = 0;
        const matchedSkills: string[] = [];

        candidate.userSkills.forEach((us) => {
          if (
            projectSkillIds.has(us.skillId) ||
            projectSkillNames.has(us.skill.name.toLowerCase().trim())
          ) {
            matchedCount++;
            matchedSkills.push(us.skill.name);
            skillLevelSum += SKILL_LEVEL_WEIGHTS[us.level] || 0.5;
          }
        });

        const skillCoverage =
          projectSkillIds.size > 0
            ? Math.min(1.0, matchedCount / projectSkillIds.size)
            : 0.5;

        // 2. Complementary skills (25%)
        // Having at least 2 distinct skill categories or additional skills beyond exact matches
        const candidateCategories = new Set(
          candidate.userSkills.map((us) => us.skill.category).filter(Boolean),
        );
        const complementaryScore = Math.min(1.0, candidateCategories.size * 0.35);

        // 3. Availability (15%)
        const hours = candidate.availability?.hoursWeek || 0;
        const availabilityScore = hours >= 15 ? 1.0 : hours >= 8 ? 0.7 : hours > 0 ? 0.4 : 0.2;

        // 4. Interest / Looking For (10%)
        let interestScore = 0.5;
        if (
          candidate.profile?.lookingFor === LookingFor.both ||
          candidate.profile?.lookingFor === LookingFor.project
        ) {
          interestScore = 1.0;
        } else if (candidate.profile?.lookingFor === LookingFor.teammate) {
          interestScore = 0.8;
        }

        // 5. Experience / Skill Level (10%)
        const experienceScore =
          matchedCount > 0 ? skillLevelSum / matchedCount : 0.4;

        // Weighted total: strictly clamped between 0.0 and 1.0
        const rawScore =
          skillCoverage * 0.4 +
          complementaryScore * 0.25 +
          availabilityScore * 0.15 +
          interestScore * 0.1 +
          experienceScore * 0.1;

        const totalScore = Number(Math.min(1.0, Math.max(0.0, rawScore)).toFixed(3));

        return {
          userId: candidate.id,
          displayName: candidate.profile?.displayName || 'Developer',
          avatarUrl: candidate.profile?.avatarUrl,
          bio: candidate.profile?.bio,
          college: candidate.profile?.college,
          skills: candidate.userSkills.map((us) => ({
            id: us.skill.id,
            name: us.skill.name,
            level: us.level,
            category: us.skill.category,
          })),
          matchedSkills,
          score: totalScore,
          scoreBreakdown: {
            skillCoverage: Number((skillCoverage * 0.4).toFixed(3)),
            complementary: Number((complementaryScore * 0.25).toFixed(3)),
            availability: Number((availabilityScore * 0.15).toFixed(3)),
            interest: Number((interestScore * 0.1).toFixed(3)),
            experience: Number((experienceScore * 0.1).toFixed(3)),
          },
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 candidates

    // Step 3: Gemini batch enrichment on top-20 candidates
    const enrichedReasons = await this.gemini.enrichCandidates(
      project.title,
      scoredCandidates.map((c) => ({
        userId: c.userId,
        displayName: c.displayName,
        matchedSkills: c.matchedSkills,
        score: c.score,
      })),
    );

    const reasonsMap = new Map<string, { reasons: string[]; fitSummary: string }>();
    enrichedReasons.forEach((r) => {
      reasonsMap.set(r.candidateId, {
        reasons: r.reasons,
        fitSummary: r.fitSummary,
      });
    });

    const finalRecommendations = scoredCandidates.map((candidate) => {
      const enrichment = reasonsMap.get(candidate.userId);
      return {
        ...candidate,
        reasons: enrichment?.reasons || [
          `Strong skill match (${candidate.matchedSkills.join(', ')})`,
          `Match score: ${(candidate.score * 100).toFixed(0)}%`,
        ],
        fitSummary:
          enrichment?.fitSummary ||
          `${candidate.displayName} is a solid match for ${project.title}.`,
      };
    });

    // Step 4: Persist top recommendations to database
    const expiresAt = new Date(Date.now() + RECOMMENDATIONS_CACHE_TTL * 1000);

    await Promise.all(
      finalRecommendations.slice(0, 10).map((rec) =>
        this.prisma.aiRecommendation.create({
          data: {
            forUserId: userId,
            recommendedUserId: rec.userId,
            projectId,
            score: rec.score,
            scoreBreakdown: rec.scoreBreakdown,
            reasons: rec.reasons,
            expiresAt,
          },
        }),
      ),
    );

    // Cache in Redis
    await this.redis.setJsonEx(cacheKey, RECOMMENDATIONS_CACHE_TTL, finalRecommendations);

    return finalRecommendations;
  }

  /**
   * Deterministic matching algorithm for recommending open projects to a user
   */
  private async recommendProjectsForUser(userId: string, cacheKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: { include: { skill: true } },
        projectMembers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const memberProjectIds = new Set(user.projectMembers.map((pm) => pm.projectId));
    const userSkillIds = new Set(user.userSkills.map((us) => us.skillId));

    const openProjects = await this.prisma.project.findMany({
      where: {
        creatorId: { not: userId },
        id: { notIn: Array.from(memberProjectIds) },
        deletedAt: null,
      },
      include: {
        creator: { select: { id: true, profile: true } },
        requirements: { include: { skill: true } },
        _count: { select: { members: true } },
      },
      take: 40,
    });

    const scoredProjects = openProjects
      .map((proj) => {
        let matched = 0;
        const matchedSkills: string[] = [];

        proj.requirements.forEach((req) => {
          if (userSkillIds.has(req.skillId)) {
            matched++;
            matchedSkills.push(req.skill.name);
          }
        });

        const reqCount = proj.requirements.length;
        const coverage = reqCount > 0 ? matched / reqCount : 0.4;
        const score = Number(Math.min(1.0, Math.max(0.0, coverage * 0.8 + 0.2)).toFixed(3));

        return {
          project: proj,
          score,
          matchedSkills,
          reasons: [
            matched > 0
              ? `Matches ${matched} of ${reqCount} required skills (${matchedSkills.join(', ')})`
              : 'Broad match for your developer background',
            `Match score: ${(score * 100).toFixed(0)}%`,
          ],
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    await this.redis.setJsonEx(cacheKey, RECOMMENDATIONS_CACHE_TTL, scoredProjects);

    return scoredProjects;
  }
}
