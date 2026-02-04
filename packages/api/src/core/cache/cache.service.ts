import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memory = new Map<string, { value: string; expiresAt?: number }>();

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis | null,
  ) {
    if (!redis) {
      this.logger.warn('Running with in-memory cache (no Redis)');
    }
  }

  private isMemoryExpired(entry: { value: string; expiresAt?: number }): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      if (!entry || this.isMemoryExpired(entry)) {
        this.memory.delete(key);
        return null;
      }
      try { return JSON.parse(entry.value) as T; } catch { return entry.value as T; }
    }
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
    if (!this.redis) {
      this.memory.set(key, {
        value: serialized,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
      return;
    }
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) { this.memory.delete(key); return; }
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.redis) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of this.memory.keys()) {
        if (regex.test(key)) this.memory.delete(key);
      }
      return;
    }
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      if (!entry || this.isMemoryExpired(entry)) { this.memory.delete(key); return false; }
      return true;
    }
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      const current = entry ? parseInt(entry.value, 10) || 0 : 0;
      this.memory.set(key, { value: String(current + 1), expiresAt: entry?.expiresAt });
      return current + 1;
    }
    return this.redis.incr(key);
  }

  async incrBy(key: string, value: number): Promise<number> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      const current = entry ? parseInt(entry.value, 10) || 0 : 0;
      this.memory.set(key, { value: String(current + value), expiresAt: entry?.expiresAt });
      return current + value;
    }
    return this.redis.incrby(key, value);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      if (entry) entry.expiresAt = Date.now() + ttlSeconds * 1000;
      return;
    }
    await this.redis.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    if (!this.redis) {
      const entry = this.memory.get(key);
      if (!entry?.expiresAt) return -1;
      const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
    return this.redis.ttl(key);
  }

  // Hash operations
  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.redis) { return null; }
    const value = await this.redis.hget(key, field);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    if (!this.redis) { return; }
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.hset(key, field, serialized);
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    if (!this.redis) { return {}; }
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
    if (!this.redis) { return; }
    await this.redis.hdel(key, field);
  }

  // List operations
  async lpush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.redis) { return 0; }
    const serialized = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.redis.lpush(key, ...serialized);
  }

  async rpush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.redis) { return 0; }
    const serialized = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.redis.rpush(key, ...serialized);
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.redis) { return []; }
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
    if (!this.redis) { return 0; }
    return this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    if (!this.redis) { return 0; }
    return this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.redis) { return []; }
    return this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.redis) { return false; }
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  // Pub/Sub
  async publish(channel: string, message: unknown): Promise<number> {
    if (!this.redis) { return 0; }
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
