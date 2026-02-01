import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-04-10',
      });
    }
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
    });
  }

  async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.checkout.sessions.create(params);
  }

  async constructWebhookEvent(body: Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
}
