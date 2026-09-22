import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SkillQueryDto } from './dto/skill.dto.js';

const SKILLS_CACHE_KEY = 'skills:all';
const SKILLS_CACHE_TTL = 3600; // 1 hour

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  // ── GET /skills ───────────────────────────────────────────────
  async getAll(query: SkillQueryDto) {
    // Try cache only when no filters (unfiltered list is most reused)
    if (!query.category && !query.search) {
      const cached = await this.redis.getJson<any[]>(SKILLS_CACHE_KEY);
      if (cached) return cached;
    }

    const skills = await this.prisma.skill.findMany({
      where: {
        ...(query.category && { category: query.category }),
        ...(query.search && {
          name: { contains: query.search, mode: 'insensitive' },
        }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Only cache the unfiltered result
    if (!query.category && !query.search) {
      await this.redis.setJsonEx(SKILLS_CACHE_KEY, SKILLS_CACHE_TTL, skills);
    }

    return skills;
  }

  // ── POST /users/me/skills ─────────────────────────────────────
  async addUserSkill(userId: string, skillId: string, level: string) {
    // Upsert — if already exists, update level
    const userSkill = await this.prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      update: { level: level as any },
      create: { userId, skillId, level: level as any },
      include: { skill: true },
    });

    // Invalidate profile and recommendation caches
    await this.redis.del(`profile:${userId}`);
    await this.redis.del(`recommendations:${userId}`);

    return userSkill;
  }

  // ── DELETE /users/me/skills/:skillId ─────────────────────────
  async removeUserSkill(userId: string, skillId: string) {
    await this.prisma.userSkill.delete({
      where: { userId_skillId: { userId, skillId } },
    });

    // Invalidate caches
    await this.redis.del(`profile:${userId}`);
    await this.redis.del(`recommendations:${userId}`);

    return { message: 'Skill removed successfully' };
  }

  // ── Invalidate skills cache (called by admin on skill CRUD) ───
  async invalidateSkillsCache() {
    await this.redis.del(SKILLS_CACHE_KEY);
  }
}
