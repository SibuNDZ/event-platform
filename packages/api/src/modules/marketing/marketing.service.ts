import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { EmailService } from '../communications/email.service';
import { CaptchaService } from './captcha.service';
import { CreateDemoLeadDto } from './dto/demo-lead.dto';

interface LeadMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService
  ) {}

  async createDemoLead(dto: CreateDemoLeadDto, meta: LeadMeta) {
    await this.captchaService.verify(dto.captchaToken, meta.ipAddress);

    const lead = await this.prisma.demoLead.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        company: dto.company,
        phone: dto.phone,
        eventSize: dto.eventSize,
        message: dto.message,
        source: 'web',
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        utmTerm: dto.utmTerm,
        utmContent: dto.utmContent,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    await this.notifyTeam(lead);
    await this.sendWebhook(lead);

    return lead;
  }

  private async notifyTeam(lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string | null;
    eventSize: string | null;
    message: string | null;
    createdAt: Date;
  }) {
    const to = this.configService.get<string>('DEMO_LEAD_NOTIFY_EMAIL');
    if (!to) {
      this.logger.warn('DEMO_LEAD_NOTIFY_EMAIL not set; skipping lead notification');
      return;
    }

    await this.emailService.send({
      to,
      subject: `New demo request from ${lead.firstName} ${lead.lastName}`,
      html: `
        <h2>New Demo Lead</h2>
        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Company:</strong> ${lead.company}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
        <p><strong>Event Size:</strong> ${lead.eventSize || 'N/A'}</p>
        <p><strong>Message:</strong> ${lead.message || 'N/A'}</p>
        <p><strong>Lead ID:</strong> ${lead.id}</p>
        <p><strong>Submitted:</strong> ${lead.createdAt.toISOString()}</p>
      `,
      replyTo: lead.email,
    });
  }

  private async sendWebhook(lead: Record<string, unknown>) {
    const webhookUrl = this.configService.get<string>('DEMO_LEAD_WEBHOOK_URL');
    if (!webhookUrl) {
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'demo_lead.created', data: lead }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
    } catch (error) {
      this.logger.warn('Failed to send demo lead webhook', error as Error);
    }
  }
}
