import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { WebhookEventType } from '../../modules/webhooks/webhook-events.constants';

export interface PlatformEvent<T = Record<string, unknown>> {
  organizationId: string;
  eventType: WebhookEventType;
  data: T;
  metadata?: {
    userId?: string;
    eventId?: string;
    source?: string;
  };
}

type EventListener = (event: PlatformEvent) => void;
type AnyEventListener = (eventType: string, event: PlatformEvent) => void;

@Injectable()
export class EventEmitterService implements OnModuleInit {
  private readonly logger = new Logger(EventEmitterService.name);
  private readonly emitter = new EventEmitter();
  private anyListeners: AnyEventListener[] = [];

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  onModuleInit(): void {
    this.logger.log('Event emitter service initialized');
  }

  /**
   * Emit a platform event that can trigger webhooks
   */
  emit<T = Record<string, unknown>>(event: PlatformEvent<T>): void {
    this.logger.debug(`Emitting event: ${event.eventType} for org ${event.organizationId}`);
    this.emitter.emit(event.eventType, event);
    // Notify all "any" listeners
    for (const listener of this.anyListeners) {
      try {
        listener(event.eventType, event as PlatformEvent);
      } catch (error) {
        this.logger.error(`Error in event listener: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: string, listener: EventListener): void {
    this.emitter.on(eventType, listener);
  }

  /**
   * Subscribe to all events (wildcard)
   */
  onAny(listener: AnyEventListener): void {
    this.anyListeners.push(listener);
  }

  /**
   * Remove a listener
   */
  off(eventType: string, listener: EventListener): void {
    this.emitter.off(eventType, listener);
  }

  /**
   * Remove an "any" listener
   */
  offAny(listener: AnyEventListener): void {
    this.anyListeners = this.anyListeners.filter((l) => l !== listener);
  }

  /**
   * Subscribe to an event once
   */
  once(eventType: string, listener: EventListener): void {
    this.emitter.once(eventType, listener);
  }
}
