import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  root(): { message: string; version: string } {
    return {
      message: 'Event Platform API',
      version: '1.0.0',
    };
  }
}
