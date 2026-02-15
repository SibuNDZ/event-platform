import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookQueryDto,
  WebhookDeliveryQueryDto,
  TestWebhookDto,
} from './dto/webhook.dto';
import { Webhook, WebhookDelivery } from '@event-platform/database';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  async create(@Body() dto: CreateWebhookDto): Promise<Webhook> {
    return this.webhooksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhooks' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async findAll(@Query() query: WebhookQueryDto): Promise<{
    data: Webhook[];
    total: number;
    page: number;
    perPage: number;
  }> {
    return this.webhooksService.findAll(query);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get available webhook event types' })
  @ApiResponse({ status: 200, description: 'List of available event types' })
  getAvailableEvents(): { events: string[] } {
    return { events: this.webhooksService.getAvailableEvents() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async findOne(@Param('id') id: string): Promise<Webhook> {
    return this.webhooksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateWebhookDto): Promise<Webhook> {
    return this.webhooksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 204, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.webhooksService.delete(id);
  }

  @Post(':id/rotate-secret')
  @ApiOperation({ summary: 'Rotate webhook signing secret' })
  @ApiResponse({ status: 200, description: 'New secret generated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async rotateSecret(@Param('id') id: string): Promise<{ secret: string }> {
    return this.webhooksService.rotateSecret(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Send a test webhook delivery' })
  @ApiResponse({ status: 200, description: 'Test webhook queued' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async test(@Param('id') id: string, @Body() dto: TestWebhookDto): Promise<WebhookDelivery> {
    return this.webhooksService.testWebhook(id, dto.event);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  @ApiResponse({ status: 200, description: 'List of deliveries' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getDeliveries(
    @Param('id') id: string,
    @Query() query: WebhookDeliveryQueryDto
  ): Promise<{
    data: WebhookDelivery[];
    total: number;
    page: number;
    perPage: number;
  }> {
    return this.webhooksService.getDeliveries(id, query);
  }
}
