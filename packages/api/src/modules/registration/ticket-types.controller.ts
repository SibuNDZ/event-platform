import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';
import { TicketType } from '@event-platform/database';

@ApiTags('ticket-types')
@Controller({ path: 'events/:eventId/ticket-types', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create ticket type' })
  async create(@Param('eventId') eventId: string, @Body() dto: any): Promise<TicketType> {
    return this.ticketTypesService.create(eventId, dto);
  }

  @Get()
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get ticket types for event' })
  async findAll(@Param('eventId') eventId: string): Promise<TicketType[]> {
    return this.ticketTypesService.findByEvent(eventId);
  }

  @Get(':id')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get ticket type by ID' })
  async findOne(@Param('id') id: string): Promise<TicketType> {
    return this.ticketTypesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update ticket type' })
  async update(@Param('id') id: string, @Body() dto: any): Promise<TicketType> {
    return this.ticketTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ticket type' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.ticketTypesService.delete(id);
  }
}
