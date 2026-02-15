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
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';
import { BadgeTemplate } from '@event-platform/database';

@ApiTags('badges')
@Controller({ path: 'events/:eventId/badges', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post('templates')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create badge template' })
  async createTemplate(
    @Param('eventId') eventId: string,
    @Body() dto: any
  ): Promise<BadgeTemplate> {
    return this.badgesService.createTemplate(eventId, dto);
  }

  @Get('templates')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get badge templates' })
  async getTemplates(@Param('eventId') eventId: string): Promise<BadgeTemplate[]> {
    return this.badgesService.getTemplates(eventId);
  }

  @Get('templates/:id')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get badge template by ID' })
  async getTemplate(@Param('id') id: string): Promise<BadgeTemplate> {
    return this.badgesService.getTemplate(id);
  }

  @Put('templates/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update badge template' })
  async updateTemplate(@Param('id') id: string, @Body() dto: any): Promise<BadgeTemplate> {
    return this.badgesService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete badge template' })
  async deleteTemplate(@Param('id') id: string) {
    await this.badgesService.deleteTemplate(id);
  }
}
