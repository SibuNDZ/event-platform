import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import { QUEUE_CONNECTION, QUEUES } from './queue.constants';

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

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private readonly enabled: boolean;

  constructor(
    @Inject(QUEUE_CONNECTION)
    private readonly connection: ConnectionOptions | null,
  ) {
    this.enabled = connection !== null;

    if (!this.enabled) {
      this.logger.warn('Queue service disabled (no Redis connection)');
      return;
    }

    // Initialize queues
    Object.values(QUEUES).forEach((queueName) => {
      this.getQueue(queueName);
    });
  }

  getQueue(name: string): Queue {
    if (!this.enabled || !this.connection) {
      return null as unknown as Queue;
    }
    if (!this.queues.has(name)) {
      const queue = new Queue(name, { connection: this.connection });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async addJob<T extends JobData>(
    queueName: string,
    job: QueueJob<T>,
  ): Promise<Job<T> | null> {
    if (!this.enabled) {
      this.logger.warn(`Job ${job.name} dropped — queue ${queueName} disabled (no Redis)`);
      return null;
    }
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

  async addBulk<T extends JobData>(
    queueName: string,
    jobs: QueueJob<T>[],
  ): Promise<Job<T>[]> {
    if (!this.enabled) {
      this.logger.warn(`${jobs.length} jobs dropped — queue ${queueName} disabled (no Redis)`);
      return [];
    }
    const queue = this.getQueue(queueName);
    return queue.addBulk(
      jobs.map((job) => ({
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
      })),
    );
  }

  registerWorker<T extends JobData>(
    queueName: string,
    processor: (job: Job<T>) => Promise<unknown>,
    concurrency = 5,
  ): Worker<T> | null {
    if (!this.enabled || !this.connection) {
      this.logger.warn(`Worker for queue ${queueName} not registered (no Redis)`);
      return null;
    }

    if (this.workers.has(queueName)) {
      return this.workers.get(queueName) as Worker<T>;
    }

    const worker = new Worker<T>(queueName, processor, {
      connection: this.connection,
      concurrency,
    });

    worker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(
        `Job ${job?.id} failed in queue ${queueName}: ${err.message}`,
        err.stack,
      );
    });

    worker.on('error', (err) => {
      this.logger.error(`Worker error in queue ${queueName}: ${err.message}`, err.stack);
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  async getJobCounts(queueName: string) {
    if (!this.enabled) return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    const queue = this.getQueue(queueName);
    return queue.getJobCounts();
  }

  async pauseQueue(queueName: string): Promise<void> {
    if (!this.enabled) return;
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resumeQueue(queueName: string): Promise<void> {
    if (!this.enabled) return;
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async cleanQueue(
    queueName: string,
    grace: number = 0,
    limit: number = 0,
    type: 'completed' | 'wait' | 'active' | 'delayed' | 'failed' = 'completed',
  ): Promise<string[]> {
    if (!this.enabled) return [];
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
}
