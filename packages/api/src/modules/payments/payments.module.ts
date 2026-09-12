import { Module, forwardRef } from '@nestjs/common';
import { RegistrationModule } from '../registration/registration.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';

@Module({
  imports: [forwardRef(() => RegistrationModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
