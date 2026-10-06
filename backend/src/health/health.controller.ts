import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — used by Render keep-alive cron' })
  async check() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    try {
      await this.redis.ping();
    } catch {
      redisStatus = 'error';
    }

    return {
      db: dbStatus,
      redis: redisStatus,
      uptime: process.uptime(),
    };
  }
}
