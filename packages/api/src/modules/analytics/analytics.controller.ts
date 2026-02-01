import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/tenant/tenant.guard';
import { Roles } from '../../core/tenant/tenant.decorator';

@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('events/:eventId/dashboard')
  @Roles('VIEWER')
  @ApiOperation({ summary: 'Get event dashboard analytics' })
  async getDashboard(@Param('eventId') eventId: string): Promise<object> {
    return this.analyticsService.getDashboard(eventId);
  }

  @Get('events/:eventId/export/attendees')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Export attendees' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportAttendees(
    @Param('eventId') eventId: string,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
    @Res() res: Response,
  ) {
    const { filename, content, contentType } = await this.analyticsService.exportAttendees(
      eventId,
      format,
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
}
