import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    createCheckoutSession(params: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    constructWebhookEvent(body: Buffer, signature: string): Promise<Stripe.Event>;
}
//# sourceMappingURL=stripe.service.d.ts.map