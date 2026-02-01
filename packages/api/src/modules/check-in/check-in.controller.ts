import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckInService, CheckInDto } from './check-in.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';

@ApiTags('check-in')
@Controller({ path: 'check-in', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @Roles('STAFF')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in attendee by QR code' })
  async checkIn(@Body() dto: CheckInDto) {
    return this.checkInService.checkIn(dto);
  }

  @Get('stats/:eventId')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get check-in statistics for event' })
  async getStats(@Param('eventId') eventId: string) {
    return this.checkInService.getCheckInStats(eventId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Undo check-in' })
  async undoCheckIn(@Param('id') id: string) {
    await this.checkInService.undoCheckIn(id);
  }
}
