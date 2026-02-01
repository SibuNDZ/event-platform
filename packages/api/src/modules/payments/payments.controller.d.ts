import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    stripeWebhook(body: any): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=payments.controller.d.ts.map