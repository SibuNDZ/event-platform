import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';
import { Attendee } from '@event-platform/database';

@ApiTags('attendees')
@Controller({ path: 'events/:eventId/attendees', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Get()
  @Roles('STAFF')
  @ApiOperation({ summary: 'Get attendees for event' })
  async findAll(@Param('eventId') eventId: string, @Query() query: any): Promise<object> {
    return this.attendeesService.findByEvent(eventId, query);
  }

  @Get(':id')
  @Roles('STAFF')
  @ApiOperation({ summary: 'Get attendee by ID' })
  async findOne(@Param('id') id: string): Promise<Attendee> {
    return this.attendeesService.findOne(id);
  }

  @Put(':id')
  @Roles('STAFF')
  @ApiOperation({ summary: 'Update attendee' })
  async update(@Param('id') id: string, @Body() dto: any): Promise<Attendee> {
    return this.attendeesService.update(id, dto);
  }
}
