import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import Joi from 'joi';

import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SkillsModule } from './skills/skills.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { HackathonsModule } from './hackathons/hackathons.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AiModule } from './ai/ai.module.js';
import { AdminModule } from './admin/admin.module.js';
import { HealthModule } from './health/health.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_URL: Joi.string().required(),
        GEMINI_API_KEY: Joi.string().required(),
        FIREBASE_SERVICE_ACCOUNT: Joi.string().required(),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
    }),

    // ── Rate Limiting ────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // ── Core Modules ─────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    HealthModule,

    // ── Feature Modules ───────────────────────────────────────────
    AuthModule,
    UsersModule,
    SkillsModule,
    ProjectsModule,
    TeamsModule,
    HackathonsModule,
    NotificationsModule,
    AiModule,
    AdminModule,
  ],
  providers: [
    // Apply JWT guard globally — use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Apply Roles guard globally — use @Roles() to restrict
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
