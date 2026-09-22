import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    let redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl || redisUrl === 'redis://localhost:6379') {
      const restUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
      const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
      if (restUrl && token) {
        const host = restUrl.replace('https://', '').replace('/', '');
        redisUrl = `rediss://default:${token}@${host}:6379`;
      }
    }

    this.client = new Redis(redisUrl || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis connection error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * Set with TTL in seconds
   */
  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.setex(key, ttlSeconds, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJsonEx<T>(key: string, ttlSeconds: number, value: T): Promise<void> {
    await this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }
}
