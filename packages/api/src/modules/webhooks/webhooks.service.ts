import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { QueueService } from '../../core/queue/queue.service';
import { QUEUES } from '../../core/queue/queue.constants';
import { Webhook, WebhookDelivery, Prisma } from '@event-platform/database';
import { createHmac, randomBytes } from 'crypto';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookQueryDto,
  WebhookDeliveryQueryDto,
} from './dto/webhook.dto';
import { ALL_WEBHOOK_EVENTS, WEBHOOK_EVENTS, WebhookEventType } from './webhook-events.constants';

export interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  organizationId: string;
  data: Record<string, unknown>;
}

export interface WebhookDeliveryJob {
  webhookId: string;
  deliveryId: string;
  url: string;
  secret: string;
  payload: WebhookPayload;
  attempt: number;
  [key: string]: unknown;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService
  ) {}

  async create(dto: CreateWebhookDto): Promise<Webhook> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Validate event types
    this.validateEventTypes(dto.events);

    // Generate signing secret
    const secret = this.generateSecret();

    const webhook = await this.prisma.webhook.create({
      data: {
        organizationId,
        name: dto.name,
        url: dto.url,
        secret,
        events: dto.events,
        isActive: dto.isActive ?? true,
      },
    });

    return webhook;
  }

  async findAll(query: WebhookQueryDto): Promise<{
    data: Webhook[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const page = query.page || 1;
    const perPage = query.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { organizationId };
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.webhook.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhook.count({ where }),
    ]);

    // Mask secrets in response
    const maskedData = data.map((webhook) => ({
      ...webhook,
      secret: this.maskSecret(webhook.secret),
    }));

    return { data: maskedData as Webhook[], total, page, perPage };
  }

  async findOne(id: string): Promise<Webhook> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return {
      ...webhook,
      secret: this.maskSecret(webhook.secret),
    } as Webhook;
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const existing = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    // Validate event types if provided
    if (dto.events) {
      this.validateEventTypes(dto.events);
    }

    const webhook = await this.prisma.webhook.update({
      where: { id },
      data: {
        name: dto.name,
        url: dto.url,
        events: dto.events,
        isActive: dto.isActive,
      },
    });

    return {
      ...webhook,
      secret: this.maskSecret(webhook.secret),
    } as Webhook;
  }

  async delete(id: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const existing = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({ where: { id } });
  }

  async rotateSecret(id: string): Promise<{ secret: string }> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const existing = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    const newSecret = this.generateSecret();

    await this.prisma.webhook.update({
      where: { id },
      data: { secret: newSecret },
    });

    // Return full secret only on rotation
    return { secret: newSecret };
  }

  async getDeliveries(
    webhookId: string,
    query: WebhookDeliveryQueryDto
  ): Promise<{
    data: WebhookDelivery[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Verify webhook belongs to organization
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const page = query.page || 1;
    const perPage = query.perPage || 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { webhookId };
    if (query.event) {
      where.event = query.event;
    }
    if (query.success !== undefined) {
      if (query.success) {
        where.statusCode = { gte: 200, lt: 300 };
      } else {
        where.OR = [
          { statusCode: { lt: 200 } },
          { statusCode: { gte: 300 } },
          { failedAt: { not: null } },
        ];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookDelivery.count({ where }),
    ]);

    return { data, total, page, perPage };
  }

  async testWebhook(id: string, event?: string): Promise<WebhookDelivery> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const testEvent = event || WEBHOOK_EVENTS.TEST_PING;

    // Create a test payload
    const payload: WebhookPayload = {
      id: `test_${randomBytes(8).toString('hex')}`,
      event: testEvent,
      timestamp: new Date().toISOString(),
      organizationId,
      data: {
        message: 'This is a test webhook delivery',
        webhookId: webhook.id,
        webhookName: webhook.name,
      },
    };

    // Create delivery record
    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: testEvent,
        payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
        attempt: 1,
      },
    });

    // Queue for immediate delivery
    await this.queueService.addJob<WebhookDeliveryJob>(QUEUES.WEBHOOK, {
      name: 'deliver',
      data: {
        webhookId: webhook.id,
        deliveryId: delivery.id,
        url: webhook.url,
        secret: webhook.secret,
        payload,
        attempt: 1,
      },
    });

    return delivery;
  }

  /**
   * Trigger webhooks for a specific event.
   * Called by other services when events occur.
   */
  async trigger(
    organizationId: string,
    event: WebhookEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    // Find all active webhooks subscribed to this event
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) {
      return;
    }

    this.logger.debug(`Triggering ${webhooks.length} webhooks for event ${event}`);

    for (const webhook of webhooks) {
      const payload: WebhookPayload = {
        id: `evt_${randomBytes(12).toString('hex')}`,
        event,
        timestamp: new Date().toISOString(),
        organizationId,
        data,
      };

      // Create delivery record
      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
          attempt: 1,
        },
      });

      // Queue for delivery
      await this.queueService.addJob<WebhookDeliveryJob>(QUEUES.WEBHOOK, {
        name: 'deliver',
        data: {
          webhookId: webhook.id,
          deliveryId: delivery.id,
          url: webhook.url,
          secret: webhook.secret,
          payload,
          attempt: 1,
        },
        opts: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 60000, // 1 minute, then 2, 4, 8, 16 minutes
          },
        },
      });
    }

    // Update lastTriggeredAt for all webhooks
    await this.prisma.webhook.updateMany({
      where: { id: { in: webhooks.map((w) => w.id) } },
      data: { lastTriggeredAt: new Date() },
    });
  }

  /**
   * Get available webhook event types
   */
  getAvailableEvents(): string[] {
    return ALL_WEBHOOK_EVENTS;
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private validateEventTypes(events: string[]): void {
    const invalidEvents = events.filter((e) => !ALL_WEBHOOK_EVENTS.includes(e as WebhookEventType));
    if (invalidEvents.length > 0) {
      throw new ForbiddenException(`Invalid event types: ${invalidEvents.join(', ')}`);
    }
  }

  private generateSecret(): string {
    return `whsec_${randomBytes(24).toString('hex')}`;
  }

  private maskSecret(secret: string): string {
    if (secret.length <= 12) return '***';
    return `${secret.slice(0, 10)}${'*'.repeat(secret.length - 10)}`;
  }
}
