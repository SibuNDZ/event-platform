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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService, CreateSessionDto, UpdateSessionDto } from './sessions.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';

@ApiTags('sessions')
@Controller({ path: 'events/:eventId/sessions', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a session' })
  async create(@Param('eventId') eventId: string, @Body() dto: Omit<CreateSessionDto, 'eventId'>) {
    return this.sessionsService.create({ ...dto, eventId });
  }

  @Get()
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get all sessions for event' })
  async findAll(@Param('eventId') eventId: string) {
    return this.sessionsService.findByEvent(eventId);
  }

  @Get(':id')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get session by ID' })
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update session' })
  async update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete session' })
  async delete(@Param('id') id: string) {
    await this.sessionsService.delete(id);
  }
}
