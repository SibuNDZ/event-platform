import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../../core/auth/decorators/public.decorator';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/stripe')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(@Body() body: any) {
    // Handle Stripe webhooks
    return { received: true };
  }
}
