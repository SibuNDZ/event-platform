"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    resend = null;
    defaultFrom;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        this.defaultFrom = this.configService.get('EMAIL_FROM', 'noreply@example.com');
    }
    async send(options) {
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
        }
        catch (error) {
            this.logger.error('Failed to send email', error);
            return false;
        }
    }
    async sendConfirmationEmail(to, eventName, ticketUrl) {
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
    async sendReminderEmail(to, eventName, eventDate) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map