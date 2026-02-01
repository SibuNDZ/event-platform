import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';

@ApiTags('tickets')
@Controller({ path: 'tickets', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Get ticket by QR code' })
  async findByQrCode(@Param('qrCode') qrCode: string) {
    return this.ticketsService.findByQrCode(qrCode);
  }
}
