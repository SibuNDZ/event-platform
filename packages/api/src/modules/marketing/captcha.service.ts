import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private readonly configService: ConfigService) {}

  async verify(token?: string, ipAddress?: string): Promise<void> {
    const secret = this.configService.get<string>('HCAPTCHA_SECRET_KEY');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    if (!secret) {
      if (isProd) {
        throw new InternalServerErrorException('Captcha is not configured');
      }
      this.logger.warn('HCAPTCHA_SECRET_KEY not set; skipping verification');
      return;
    }

    if (!token) {
      throw new BadRequestException('Captcha token is required');
    }

    const body = new URLSearchParams({
      secret,
      response: token,
    });

    if (ipAddress) {
      body.append('remoteip', ipAddress);
    }

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new BadRequestException('Captcha verification failed');
    }

    const data = (await response.json()) as { success?: boolean };
    if (!data?.success) {
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
