"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const cache_service_1 = require("./cache.service");
exports.REDIS_CLIENT = 'REDIS_CLIENT';
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.REDIS_CLIENT,
                useFactory: (configService) => {
                    const redisUrl = configService.get('REDIS_URL', 'redis://localhost:6379');
                    return new ioredis_1.default(redisUrl, {
                        maxRetriesPerRequest: 3,
                        retryStrategy(times) {
                            const delay = Math.min(times * 50, 2000);
                            return delay;
                        },
                    });
                },
                inject: [config_1.ConfigService],
            },
            cache_service_1.CacheService,
        ],
        exports: [exports.REDIS_CLIENT, cache_service_1.CacheService],
    })
], CacheModule);
//# sourceMappingURL=cache.module.js.map