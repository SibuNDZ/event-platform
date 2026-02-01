import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@example.com');
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const result = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          content_type: a.contentType,
        })),
      });

      this.logger.log(`Email sent successfully: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      return false;
    }
  }

  async sendConfirmationEmail(to: string, eventName: string, ticketUrl: string) {
    return this.send({
      to,
      subject: `Your registration for ${eventName} is confirmed!`,
      html: `
        <h1>Registration Confirmed</h1>
        <p>Thank you for registering for ${eventName}!</p>
        <p>Your ticket is attached to this email. You can also view it here:</p>
        <a href="${ticketUrl}">View Ticket</a>
      `,
    });
  }

  async sendReminderEmail(to: string, eventName: string, eventDate: Date) {
    return this.send({
      to,
      subject: `Reminder: ${eventName} is coming up!`,
      html: `
        <h1>Event Reminder</h1>
        <p>${eventName} is happening on ${eventDate.toLocaleDateString()}!</p>
        <p>We look forward to seeing you there.</p>
      `,
    });
  }
}
