import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

const PROFILE_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        profile: true,
        userSkills: { include: { skill: true } },
        availability: true,
      },
    });
  }

  async updateMe(userId: string, dto: any) {
    await this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
    // Invalidate caches
    await this.redis.del(`profile:${userId}`);
    await this.redis.del(`recommendations:${userId}`);
    return this.getMe(userId);
  }

  async getPublicProfile(userId: string) {
    const cached = await this.redis.getJson(`profile:${userId}`);
    if (cached) return cached;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            userSkills: { include: { skill: true } },
            availability: true,
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    await this.redis.setJsonEx(`profile:${userId}`, PROFILE_CACHE_TTL, profile);
    return profile;
  }

  async saveFcmToken(userId: string, fcmToken: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { fcmToken } });
    return { message: 'FCM token registered' };
  }
}
