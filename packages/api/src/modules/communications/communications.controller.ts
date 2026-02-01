import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';

@ApiTags('communications')
@Controller({ path: 'communications', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommunicationsController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-test')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Send test email' })
  async sendTest(@Body() dto: { to: string }) {
    const success = await this.emailService.send({
      to: dto.to,
      subject: 'Test Email from Event Platform',
      html: '<h1>Test Email</h1><p>This is a test email from your event platform.</p>',
    });

    return { success };
  }
}
