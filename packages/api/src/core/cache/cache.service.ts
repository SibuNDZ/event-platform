import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async incrBy(key: string, value: number): Promise<number> {
    return this.redis.incrby(key, value);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // Hash operations
  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.redis.hget(key, field);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.hset(key, field, serialized);
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const data = await this.redis.hgetall(key);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value) as T;
      } catch {
        result[field] = value as T;
      }
    }
    return result;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.redis.hdel(key, field);
  }

  // List operations
  async lpush(key: string, ...values: unknown[]): Promise<number> {
    const serialized = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.redis.lpush(key, ...serialized);
  }

  async rpush(key: string, ...values: unknown[]): Promise<number> {
    const serialized = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.redis.rpush(key, ...serialized);
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.redis.lrange(key, start, stop);
    return values.map((v) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as T;
      }
    });
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  // Pub/Sub
  async publish(channel: string, message: unknown): Promise<number> {
    const serialized = typeof message === 'string' ? message : JSON.stringify(message);
    return this.redis.publish(channel, serialized);
  }

  // Cache with callback (cache aside pattern)
  async cached<T>(
    key: string,
    ttlSeconds: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
