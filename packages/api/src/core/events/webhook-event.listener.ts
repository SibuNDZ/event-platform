import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import { EventEmitterService, PlatformEvent } from './event-emitter.service';
import { WebhooksService } from '../../modules/webhooks/webhooks.service';
import { WebhookEventType } from '../../modules/webhooks/webhook-events.constants';

@Injectable()
export class WebhookEventListener implements OnModuleInit {
  private readonly logger = new Logger(WebhookEventListener.name);

  constructor(
    private readonly eventEmitter: EventEmitterService,
    @Inject(forwardRef(() => WebhooksService))
    private readonly webhooksService: WebhooksService,
  ) {}

  onModuleInit(): void {
    // Subscribe to all events
    this.eventEmitter.onAny(this.handleEvent.bind(this));
    this.logger.log('Webhook event listener initialized');
  }

  private async handleEvent(eventType: string, event: PlatformEvent): Promise<void> {
    // Skip wildcard event (we handle specific events)
    if (eventType === '*') {
      return;
    }

    try {
      await this.webhooksService.trigger(
        event.organizationId,
        event.eventType as WebhookEventType,
        {
          ...event.data,
          _metadata: event.metadata,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger webhooks for event ${eventType}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
