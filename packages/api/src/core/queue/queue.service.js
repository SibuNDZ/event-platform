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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const queue_module_1 = require("./queue.module");
let QueueService = QueueService_1 = class QueueService {
    connection;
    logger = new common_1.Logger(QueueService_1.name);
    queues = new Map();
    workers = new Map();
    constructor(connection) {
        this.connection = connection;
        // Initialize queues
        Object.values(queue_module_1.QUEUES).forEach((queueName) => {
            this.getQueue(queueName);
        });
    }
    getQueue(name) {
        if (!this.queues.has(name)) {
            const queue = new bullmq_1.Queue(name, { connection: this.connection });
            this.queues.set(name, queue);
        }
        return this.queues.get(name);
    }
    async addJob(queueName, job) {
        const queue = this.getQueue(queueName);
        return queue.add(job.name, job.data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 1000,
            ...job.opts,
        });
    }
    async addBulk(queueName, jobs) {
        const queue = this.getQueue(queueName);
        return queue.addBulk(jobs.map((job) => ({
            name: job.name,
            data: job.data,
            opts: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: 100,
                removeOnFail: 1000,
                ...job.opts,
            },
        })));
    }
    registerWorker(queueName, processor, concurrency = 5) {
        if (this.workers.has(queueName)) {
            return this.workers.get(queueName);
        }
        const worker = new bullmq_1.Worker(queueName, processor, {
            connection: this.connection,
            concurrency,
        });
        worker.on('completed', (job) => {
            this.logger.debug(`Job ${job.id} completed in queue ${queueName}`);
        });
        worker.on('failed', (job, err) => {
            this.logger.error(`Job ${job?.id} failed in queue ${queueName}: ${err.message}`, err.stack);
        });
        worker.on('error', (err) => {
            this.logger.error(`Worker error in queue ${queueName}: ${err.message}`, err.stack);
        });
        this.workers.set(queueName, worker);
        return worker;
    }
    async getJobCounts(queueName) {
        const queue = this.getQueue(queueName);
        return queue.getJobCounts();
    }
    async pauseQueue(queueName) {
        const queue = this.getQueue(queueName);
        await queue.pause();
    }
    async resumeQueue(queueName) {
        const queue = this.getQueue(queueName);
        await queue.resume();
    }
    async cleanQueue(queueName, grace = 0, limit = 0, type = 'completed') {
        const queue = this.getQueue(queueName);
        return queue.clean(grace, limit, type);
    }
    async onModuleDestroy() {
        // Close all workers
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        // Close all queues
        for (const queue of this.queues.values()) {
            await queue.close();
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(queue_module_1.QUEUE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map