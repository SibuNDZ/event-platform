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
import { SpeakersService } from './speakers.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';

@ApiTags('speakers')
@Controller({ path: 'events/:eventId/speakers', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a speaker' })
  async create(@Param('eventId') eventId: string, @Body() dto: any) {
    return this.speakersService.create(eventId, dto);
  }

  @Get()
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get all speakers for event' })
  async findAll(@Param('eventId') eventId: string) {
    return this.speakersService.findByEvent(eventId);
  }

  @Get(':id')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get speaker by ID' })
  async findOne(@Param('id') id: string) {
    return this.speakersService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update speaker' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.speakersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete speaker' })
  async delete(@Param('id') id: string) {
    await this.speakersService.delete(id);
  }
}
