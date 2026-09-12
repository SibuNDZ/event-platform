import { Module, forwardRef } from '@nestjs/common';
import { CommunicationsModule } from '../communications/communications.module';
import { PaymentsModule } from '../payments/payments.module';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesService } from './ticket-types.service';

@Module({
  imports: [forwardRef(() => PaymentsModule), CommunicationsModule],
  controllers: [RegistrationController, TicketTypesController, AttendeesController],
  providers: [RegistrationService, TicketTypesService, AttendeesService],
  exports: [RegistrationService, TicketTypesService, AttendeesService],
})
export class RegistrationModule {}
