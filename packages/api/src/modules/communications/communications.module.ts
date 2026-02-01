import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CommunicationsController } from './communications.controller';

@Module({
  controllers: [CommunicationsController],
  providers: [EmailService],
  exports: [EmailService],
})
export class CommunicationsModule {}
