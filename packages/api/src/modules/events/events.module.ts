import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SpeakersService } from './speakers.service';
import { SpeakersController } from './speakers.controller';

@Module({
  controllers: [EventsController, SessionsController, SpeakersController],
  providers: [EventsService, SessionsService, SpeakersService],
  exports: [EventsService, SessionsService, SpeakersService],
})
export class EventsModule {}
