import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';

@Module({
  controllers: [RegistrationController, TicketTypesController, AttendeesController],
  providers: [RegistrationService, TicketTypesService, AttendeesService],
  exports: [RegistrationService, TicketTypesService, AttendeesService],
})
export class RegistrationModule {}
