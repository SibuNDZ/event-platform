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
import { IntegrationsService, IntegrationConfig } from './integrations.service';
import {
  CreateApiKeyDto,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationType,
} from './dto/integration.dto';
import { ApiKey } from '@event-platform/database';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // ==================== API KEYS ====================

  @Post('api-keys')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created. Key is only shown once.' })
  async createApiKey(@Body() dto: CreateApiKeyDto): Promise<{ key: string; apiKey: ApiKey }> {
    return this.integrationsService.createApiKey(dto);
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async listApiKeys(): Promise<ApiKey[]> {
    return this.integrationsService.listApiKeys();
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 204, description: 'API key revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeApiKey(@Param('id') id: string): Promise<void> {
    return this.integrationsService.revokeApiKey(id);
  }

  @Get('api-keys/scopes')
  @ApiOperation({ summary: 'Get available API scopes' })
  @ApiResponse({ status: 200, description: 'List of available scopes' })
  getAvailableScopes(): { scopes: string[] } {
    return { scopes: this.integrationsService.getAvailableScopes() };
  }

  // ==================== CRM INTEGRATIONS ====================

  @Get('types')
  @ApiOperation({ summary: 'Get supported integration types' })
  @ApiResponse({ status: 200, description: 'List of supported integration types' })
  getSupportedTypes(): { types: { type: string; name: string; oauthSupported: boolean }[] } {
    return { types: this.integrationsService.getSupportedTypes() };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new CRM integration' })
  @ApiResponse({ status: 201, description: 'Integration created' })
  async createIntegration(@Body() dto: CreateIntegrationDto): Promise<IntegrationConfig> {
    return this.integrationsService.createIntegration(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all integrations' })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  async listIntegrations(): Promise<IntegrationConfig[]> {
    return this.integrationsService.listIntegrations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an integration by ID' })
  @ApiResponse({ status: 200, description: 'Integration details' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(@Param('id') id: string): Promise<IntegrationConfig> {
    return this.integrationsService.getIntegration(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({ status: 200, description: 'Integration updated' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateIntegration(
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto
  ): Promise<IntegrationConfig> {
    return this.integrationsService.updateIntegration(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an integration' })
  @ApiResponse({ status: 204, description: 'Integration deleted' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async deleteIntegration(@Param('id') id: string): Promise<void> {
    return this.integrationsService.deleteIntegration(id);
  }

  @Get(':type/oauth-url')
  @ApiOperation({ summary: 'Get OAuth authorization URL for a CRM' })
  @ApiResponse({ status: 200, description: 'OAuth URL' })
  getOAuthUrl(
    @Param('type') type: IntegrationType,
    @Query('state') state: string
  ): { url: string } {
    return { url: this.integrationsService.getOAuthUrl(type, state) };
  }
}
