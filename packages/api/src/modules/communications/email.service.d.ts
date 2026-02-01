import { ConfigService } from '@nestjs/config';
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
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private resend;
    private readonly defaultFrom;
    constructor(configService: ConfigService);
    send(options: SendEmailOptions): Promise<boolean>;
    sendConfirmationEmail(to: string, eventName: string, ticketUrl: string): Promise<boolean>;
    sendReminderEmail(to: string, eventName: string, eventDate: Date): Promise<boolean>;
}
//# sourceMappingURL=email.service.d.ts.map