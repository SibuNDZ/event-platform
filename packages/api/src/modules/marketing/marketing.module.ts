import { Module } from '@nestjs/common';
import { CommunicationsModule } from '../communications/communications.module';
import { CaptchaService } from './captcha.service';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';

@Module({
  imports: [CommunicationsModule],
  controllers: [MarketingController],
  providers: [MarketingService, CaptchaService],
})
export class MarketingModule {}
