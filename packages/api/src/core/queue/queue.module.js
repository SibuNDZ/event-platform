"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = exports.QUEUES = exports.QUEUE_CONNECTION = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const queue_service_1 = require("./queue.service");
exports.QUEUE_CONNECTION = 'QUEUE_CONNECTION';
// Queue names
exports.QUEUES = {
    EMAIL: 'email',
    PDF: 'pdf-generation',
    TICKET: 'ticket-processing',
    WEBHOOK: 'webhook-delivery',
    ANALYTICS: 'analytics',
    NOTIFICATION: 'notification',
};
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.QUEUE_CONNECTION,
                useFactory: (configService) => {
                    const redisUrl = configService.get('REDIS_URL', 'redis://localhost:6379');
                    const url = new URL(redisUrl);
                    return {
                        host: url.hostname,
                        port: parseInt(url.port || '6379', 10),
                        password: url.password || undefined,
                    };
                },
                inject: [config_1.ConfigService],
            },
            queue_service_1.QueueService,
        ],
        exports: [exports.QUEUE_CONNECTION, queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map