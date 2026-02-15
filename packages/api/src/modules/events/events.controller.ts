import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';
import { Public } from '../../core/auth/decorators/public.decorator';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { Event } from '@event-platform/database';

@ApiTags('events')
@Controller({ path: 'events', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async create(@Body() dto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(dto);
  }

  @Get()
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get all events for organization' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(@Query() query: EventQueryDto): Promise<object> {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Get('public/:slug')
  @Public()
  @ApiOperation({ summary: 'Get public event by slug' })
  @ApiParam({ name: 'slug', description: 'Event slug' })
  @ApiQuery({ name: 'org', required: false, description: 'Organization slug' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('org') organizationSlug?: string
  ): Promise<Event> {
    return this.eventsService.findBySlug(slug, organizationSlug);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto): Promise<Event> {
    return this.eventsService.update(id, dto);
  }

  @Post(':id/publish')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event published successfully' })
  async publish(@Param('id') id: string): Promise<Event> {
    return this.eventsService.publish(id);
  }

  @Post(':id/unpublish')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event unpublished successfully' })
  async unpublish(@Param('id') id: string): Promise<Event> {
    return this.eventsService.unpublish(id);
  }

  @Post(':id/cancel')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event cancelled successfully' })
  async cancel(@Param('id') id: string): Promise<Event> {
    return this.eventsService.cancel(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.eventsService.delete(id);
  }

  @Get(':id/stats')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Param('id') id: string): Promise<object> {
    return this.eventsService.getStats(id);
  }

  @Post(':id/duplicate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Duplicate event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 201, description: 'Event duplicated successfully' })
  async duplicate(@Param('id') id: string): Promise<Event> {
    return this.eventsService.duplicate(id);
  }
}
