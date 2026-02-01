"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const cache_module_1 = require("./cache.module");
let CacheService = class CacheService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async get(key) {
        const value = await this.redis.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.redis.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.redis.set(key, serialized);
        }
    }
    async del(key) {
        await this.redis.del(key);
    }
    async delPattern(pattern) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
    async exists(key) {
        const result = await this.redis.exists(key);
        return result === 1;
    }
    async incr(key) {
        return this.redis.incr(key);
    }
    async incrBy(key, value) {
        return this.redis.incrby(key, value);
    }
    async expire(key, ttlSeconds) {
        await this.redis.expire(key, ttlSeconds);
    }
    async ttl(key) {
        return this.redis.ttl(key);
    }
    // Hash operations
    async hget(key, field) {
        const value = await this.redis.hget(key, field);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async hset(key, field, value) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await this.redis.hset(key, field, serialized);
    }
    async hgetall(key) {
        const data = await this.redis.hgetall(key);
        const result = {};
        for (const [field, value] of Object.entries(data)) {
            try {
                result[field] = JSON.parse(value);
            }
            catch {
                result[field] = value;
            }
        }
        return result;
    }
    async hdel(key, field) {
        await this.redis.hdel(key, field);
    }
    // List operations
    async lpush(key, ...values) {
        const serialized = values.map((v) => typeof v === 'string' ? v : JSON.stringify(v));
        return this.redis.lpush(key, ...serialized);
    }
    async rpush(key, ...values) {
        const serialized = values.map((v) => typeof v === 'string' ? v : JSON.stringify(v));
        return this.redis.rpush(key, ...serialized);
    }
    async lrange(key, start, stop) {
        const values = await this.redis.lrange(key, start, stop);
        return values.map((v) => {
            try {
                return JSON.parse(v);
            }
            catch {
                return v;
            }
        });
    }
    // Set operations
    async sadd(key, ...members) {
        return this.redis.sadd(key, ...members);
    }
    async srem(key, ...members) {
        return this.redis.srem(key, ...members);
    }
    async smembers(key) {
        return this.redis.smembers(key);
    }
    async sismember(key, member) {
        const result = await this.redis.sismember(key, member);
        return result === 1;
    }
    // Pub/Sub
    async publish(channel, message) {
        const serialized = typeof message === 'string' ? message : JSON.stringify(message);
        return this.redis.publish(channel, serialized);
    }
    // Cache with callback (cache aside pattern)
    async cached(key, ttlSeconds, callback) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await callback();
        await this.set(key, value, ttlSeconds);
        return value;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], CacheService);
//# sourceMappingURL=cache.service.js.map