import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { Public } from '../../core/auth/decorators/public.decorator';

@ApiTags('registration')
@Controller({ path: 'events/:eventId/register', version: '1' })
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Register for an event' })
  async register(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.registrationService.register(eventId, dto);
  }
}
