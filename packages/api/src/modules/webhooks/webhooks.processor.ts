import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../core/database/prisma.service';
import { QueueService } from '../../core/queue/queue.service';
import { QUEUES } from '../../core/queue/queue.constants';
import { WebhookDeliveryJob, WebhooksService } from './webhooks.service';

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [60, 120, 240, 480, 960]; // seconds: 1m, 2m, 4m, 8m, 16m

@Injectable()
export class WebhooksProcessor implements OnModuleInit {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly webhooksService: WebhooksService,
  ) {}

  onModuleInit(): void {
    const worker = this.queueService.registerWorker(
      QUEUES.WEBHOOK,
      this.processDelivery.bind(this) as (job: Job) => Promise<unknown>,
      3, // concurrency
    );

    if (worker) {
      this.logger.log('Webhook delivery processor initialized');
    } else {
      this.logger.warn('Webhook delivery processor skipped (no Redis)');
    }
  }

  private async processDelivery(job: Job<WebhookDeliveryJob>): Promise<void> {
    const { webhookId, deliveryId, url, secret, payload, attempt } = job.data;

    this.logger.debug(
      `Processing webhook delivery ${deliveryId} (attempt ${attempt})`,
    );

    const startTime = Date.now();

    try {
      // Generate signature
      const payloadString = JSON.stringify(payload);
      const signature = this.webhooksService.generateSignature(
        payloadString,
        secret,
      );

      // Make HTTP request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Id': payload.id,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Timestamp': payload.timestamp,
          'User-Agent': 'EventPlatform-Webhooks/1.0',
        },
        body: payloadString,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text().catch(() => null);

      // Update delivery record
      if (response.ok) {
        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            statusCode: response.status,
            responseBody: responseBody?.slice(0, 2000), // Limit stored response
            responseTime,
            deliveredAt: new Date(),
            attempt,
          },
        });

        // Reset failure count on success
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { failureCount: 0 },
        });

        this.logger.debug(
          `Webhook delivery ${deliveryId} succeeded with status ${response.status}`,
        );
      } else {
        // Non-2xx response - treat as failure
        throw new WebhookDeliveryError(
          `HTTP ${response.status}`,
          response.status,
          responseBody,
          responseTime,
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const isWebhookError = error instanceof WebhookDeliveryError;

      await this.handleFailure(
        webhookId,
        deliveryId,
        attempt,
        isWebhookError ? error.statusCode : null,
        isWebhookError ? error.responseBody : (error as Error).message,
        responseTime,
      );

      // Rethrow to let BullMQ handle retry
      throw error;
    }
  }

  private async handleFailure(
    webhookId: string,
    deliveryId: string,
    attempt: number,
    statusCode: number | null,
    responseBody: string | null,
    responseTime: number,
  ): Promise<void> {
    const shouldRetry = attempt < MAX_ATTEMPTS;
    const retryDelaySeconds = RETRY_DELAYS[Math.min(attempt - 1, RETRY_DELAYS.length - 1)] || 960;
    const nextRetryAt = shouldRetry
      ? new Date(Date.now() + retryDelaySeconds * 1000)
      : null;

    await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        statusCode,
        responseBody: responseBody?.slice(0, 2000),
        responseTime,
        attempt,
        nextRetryAt,
        failedAt: shouldRetry ? null : new Date(),
      },
    });

    // Increment failure count
    const webhook = await this.prisma.webhook.update({
      where: { id: webhookId },
      data: { failureCount: { increment: 1 } },
    });

    // Disable webhook after too many consecutive failures
    if (webhook.failureCount >= 50) {
      await this.prisma.webhook.update({
        where: { id: webhookId },
        data: { isActive: false },
      });

      this.logger.warn(
        `Webhook ${webhookId} disabled after ${webhook.failureCount} consecutive failures`,
      );
    }

    this.logger.warn(
      `Webhook delivery ${deliveryId} failed (attempt ${attempt}/${MAX_ATTEMPTS})` +
        (shouldRetry ? ` - retrying at ${nextRetryAt?.toISOString()}` : ' - giving up'),
    );
  }
}

class WebhookDeliveryError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number | null,
    public readonly responseBody: string | null,
    public readonly responseTime: number,
  ) {
    super(message);
    this.name = 'WebhookDeliveryError';
  }
}
