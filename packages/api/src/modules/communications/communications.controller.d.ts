import { EmailService } from './email.service';
export declare class CommunicationsController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendTest(dto: {
        to: string;
    }): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=communications.controller.d.ts.map