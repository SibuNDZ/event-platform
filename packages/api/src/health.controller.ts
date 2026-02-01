import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './core/auth/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Root endpoint' })
  root(): { message: string; version: string } {
    return {
      message: 'Event Platform API',
      version: '1.0.0',
    };
  }
}
