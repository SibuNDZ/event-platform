import { Global, Module, forwardRef } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service';
import { WebhookEventListener } from './webhook-event.listener';
import { WebhooksModule } from '../../modules/webhooks/webhooks.module';

@Global()
@Module({
  imports: [forwardRef(() => WebhooksModule)],
  providers: [EventEmitterService, WebhookEventListener],
  exports: [EventEmitterService],
})
export class EventsModule {}
