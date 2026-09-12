import { Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../core/auth/decorators/public.decorator';
import { RegistrationOrderResult } from '../registration/registration.service';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, signature);
  }

  @Get('checkout/:sessionId')
  @Public()
  @ApiOperation({ summary: 'Get Stripe checkout session order status' })
  async checkoutStatus(@Param('sessionId') sessionId: string): Promise<RegistrationOrderResult> {
    return this.paymentsService.getCheckoutStatus(sessionId);
  }
}
