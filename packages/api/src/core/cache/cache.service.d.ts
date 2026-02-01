import Redis from 'ioredis';
export declare class CacheService {
    private readonly redis;
    constructor(redis: Redis);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    incr(key: string): Promise<number>;
    incrBy(key: string, value: number): Promise<number>;
    expire(key: string, ttlSeconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    hget<T>(key: string, field: string): Promise<T | null>;
    hset(key: string, field: string, value: unknown): Promise<void>;
    hgetall<T>(key: string): Promise<Record<string, T>>;
    hdel(key: string, field: string): Promise<void>;
    lpush(key: string, ...values: unknown[]): Promise<number>;
    rpush(key: string, ...values: unknown[]): Promise<number>;
    lrange<T>(key: string, start: number, stop: number): Promise<T[]>;
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    sismember(key: string, member: string): Promise<boolean>;
    publish(channel: string, message: unknown): Promise<number>;
    cached<T>(key: string, ttlSeconds: number, callback: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=cache.service.d.ts.map