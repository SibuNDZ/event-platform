import { OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
export interface JobData {
    [key: string]: unknown;
}
export interface QueueJob<T = JobData> {
    name: string;
    data: T;
    opts?: {
        delay?: number;
        attempts?: number;
        backoff?: {
            type: 'fixed' | 'exponential';
            delay: number;
        };
        priority?: number;
        removeOnComplete?: boolean | number;
        removeOnFail?: boolean | number;
    };
}
export declare class QueueService implements OnModuleDestroy {
    private readonly connection;
    private readonly logger;
    private queues;
    private workers;
    constructor(connection: ConnectionOptions);
    getQueue(name: string): Queue;
    addJob<T extends JobData>(queueName: string, job: QueueJob<T>): Promise<Job<T>>;
    addBulk<T extends JobData>(queueName: string, jobs: QueueJob<T>[]): Promise<Job<T>[]>;
    registerWorker<T extends JobData>(queueName: string, processor: (job: Job<T>) => Promise<unknown>, concurrency?: number): Worker<T>;
    getJobCounts(queueName: string): Promise<{
        [index: string]: number;
    }>;
    pauseQueue(queueName: string): Promise<void>;
    resumeQueue(queueName: string): Promise<void>;
    cleanQueue(queueName: string, grace?: number, limit?: number, type?: 'completed' | 'wait' | 'active' | 'delayed' | 'failed'): Promise<string[]>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=queue.service.d.ts.map