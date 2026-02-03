import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../core/auth/decorators/public.decorator';
import { CreateDemoLeadDto } from './dto/demo-lead.dto';
import { MarketingService } from './marketing.service';

@ApiTags('marketing')
@Controller({ path: 'marketing', version: '1' })
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('demo-leads')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a demo lead' })
  @ApiResponse({ status: 201, description: 'Demo lead created' })
  async createDemoLead(@Req() req: Request, @Body() dto: CreateDemoLeadDto) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]?.trim()
        : req.ip;

    const lead = await this.marketingService.createDemoLead(dto, {
      ipAddress,
      userAgent: req.get('user-agent') || undefined,
    });

    return { id: lead.id };
  }
}
