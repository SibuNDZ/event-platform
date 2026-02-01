import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { QueueService } from './queue.service';
import { QUEUE_CONNECTION, QUEUES } from './queue.constants';

export { QUEUE_CONNECTION, QUEUES };

@Global()
@Module({
  providers: [
    {
      provide: QUEUE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL', 'redis://localhost:6379');
        const url = new URL(redisUrl);

        return {
          host: url.hostname,
          port: parseInt(url.port || '6379', 10),
          password: url.password || undefined,
        };
      },
      inject: [ConfigService],
    },
    QueueService,
  ],
  exports: [QUEUE_CONNECTION, QueueService],
})
export class QueueModule {}
