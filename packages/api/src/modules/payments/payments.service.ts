import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from '@event-platform/database';
import type Stripe from 'stripe';
import { RegistrationOrderResult, RegistrationService } from '../registration/registration.service';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly registrationService: RegistrationService
  ) {}

  async handleStripeWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe webhook payload or signature');
    }

    let event;
    try {
      event = await this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        this.logger.warn('Stripe checkout session completed without orderId metadata');
        return { received: true };
      }

      const paymentIntent =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

      await this.registrationService.fulfillOrder(orderId, {
        provider: PaymentProvider.STRIPE,
        providerPaymentId: paymentIntent,
      });
    }

    return { received: true, type: event.type };
  }

  async getCheckoutStatus(sessionId: string): Promise<RegistrationOrderResult> {
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      throw new BadRequestException('Checkout session is not linked to an order');
    }

    if (session.payment_status === 'paid') {
      const paymentIntent =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      await this.registrationService.fulfillOrder(orderId, {
        provider: PaymentProvider.STRIPE,
        providerPaymentId: paymentIntent,
      });
    }

    return this.registrationService.getOrderResult(orderId);
  }
}
