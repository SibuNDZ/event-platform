import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator';
import { RegisterForEventDto } from './dto/registration.dto';
import { RegistrationService } from './registration.service';

@ApiTags('registration')
@Controller({ version: '1' })
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  @Public()
  @ApiOperation({ summary: 'Register for an event' })
  async register(@Param('eventId') eventId: string, @Body() dto: RegisterForEventDto) {
    return this.registrationService.register(eventId, dto);
  }

  @Get('orders/:orderId')
  @Public()
  @ApiOperation({ summary: 'Get registration order status' })
  async getOrder(@Param('orderId') orderId: string) {
    return this.registrationService.getOrderResult(orderId);
  }
}
