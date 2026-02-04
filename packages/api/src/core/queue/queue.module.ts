import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QUEUE_CONNECTION, QUEUES } from './queue.constants';

export { QUEUE_CONNECTION, QUEUES };

@Global()
@Module({
  providers: [
    {
      provide: QUEUE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('QueueModule');
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          logger.warn('REDIS_URL not set — job queues disabled');
          return null;
        }

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
