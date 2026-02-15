import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { ApiKey } from '@event-platform/database';
import { createHash, randomBytes } from 'crypto';
import {
  CreateApiKeyDto,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationType,
} from './dto/integration.dto';
import { ALL_API_SCOPES, ApiScope } from './integration-scopes.constants';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, unknown>;
  fieldMappings: Record<string, Record<string, string>>;
  syncEvents: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  // In-memory store for integrations (would be in database in production)
  // For now, using organization settings or a separate model
  private integrations: Map<string, IntegrationConfig[]> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService
  ) {}

  // ==================== API KEY MANAGEMENT ====================

  async createApiKey(dto: CreateApiKeyDto): Promise<{ key: string; apiKey: ApiKey }> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Validate scopes
    this.validateScopes(dto.scopes);

    // Generate API key
    const rawKey = `ep_${randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.slice(0, 11); // "ep_" + first 8 chars
    const keyHash = this.hashKey(rawKey);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        organizationId,
        name: dto.name,
        keyPrefix,
        keyHash,
        scopes: dto.scopes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    // Return full key only on creation
    return { key: rawKey, apiKey };
  }

  async listApiKeys(): Promise<ApiKey[]> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    return this.prisma.apiKey.findMany({
      where: {
        organizationId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(id: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async validateApiKey(key: string): Promise<{ organizationId: string; scopes: string[] } | null> {
    const keyPrefix = key.slice(0, 11);
    const keyHash = this.hashKey(key);

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        keyPrefix,
        keyHash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!apiKey) {
      return null;
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      organizationId: apiKey.organizationId,
      scopes: apiKey.scopes,
    };
  }

  getAvailableScopes(): string[] {
    return ALL_API_SCOPES;
  }

  // ==================== CRM INTEGRATIONS ====================

  async createIntegration(dto: CreateIntegrationDto): Promise<IntegrationConfig> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const integration: IntegrationConfig = {
      id: `int_${randomBytes(12).toString('hex')}`,
      name: dto.name,
      type: dto.type,
      config: dto.config || {},
      fieldMappings: dto.fieldMappings || this.getDefaultFieldMappings(dto.type),
      syncEvents: dto.syncEvents || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orgIntegrations = this.integrations.get(organizationId) || [];
    orgIntegrations.push(integration);
    this.integrations.set(organizationId, orgIntegrations);

    this.logger.log(`Created ${dto.type} integration for org ${organizationId}`);

    return integration;
  }

  async listIntegrations(): Promise<IntegrationConfig[]> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    return this.integrations.get(organizationId) || [];
  }

  async getIntegration(id: string): Promise<IntegrationConfig> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const orgIntegrations = this.integrations.get(organizationId) || [];
    const integration = orgIntegrations.find((i) => i.id === id);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async updateIntegration(id: string, dto: UpdateIntegrationDto): Promise<IntegrationConfig> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const orgIntegrations = this.integrations.get(organizationId) || [];
    const index = orgIntegrations.findIndex((i) => i.id === id);

    const existing = orgIntegrations[index];
    if (index === -1 || !existing) {
      throw new NotFoundException('Integration not found');
    }

    const updated: IntegrationConfig = {
      id: existing.id,
      type: existing.type,
      createdAt: existing.createdAt,
      name: dto.name ?? existing.name,
      config: dto.config ?? existing.config,
      fieldMappings: dto.fieldMappings ?? existing.fieldMappings,
      syncEvents: dto.syncEvents ?? existing.syncEvents,
      isActive: dto.isActive ?? existing.isActive,
      updatedAt: new Date(),
    };

    orgIntegrations[index] = updated;
    this.integrations.set(organizationId, orgIntegrations);

    return updated;
  }

  async deleteIntegration(id: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const orgIntegrations = this.integrations.get(organizationId) || [];
    const filtered = orgIntegrations.filter((i) => i.id !== id);

    if (filtered.length === orgIntegrations.length) {
      throw new NotFoundException('Integration not found');
    }

    this.integrations.set(organizationId, filtered);
  }

  /**
   * Get OAuth authorization URL for a CRM
   */
  getOAuthUrl(type: IntegrationType, state: string): string {
    switch (type) {
      case IntegrationType.SALESFORCE:
        return this.getSalesforceOAuthUrl(state);
      case IntegrationType.HUBSPOT:
        return this.getHubSpotOAuthUrl(state);
      default:
        throw new ForbiddenException(`OAuth not supported for ${type}`);
    }
  }

  /**
   * Get supported integration types
   */
  getSupportedTypes(): { type: string; name: string; oauthSupported: boolean }[] {
    return [
      { type: IntegrationType.SALESFORCE, name: 'Salesforce', oauthSupported: true },
      { type: IntegrationType.HUBSPOT, name: 'HubSpot', oauthSupported: true },
      { type: IntegrationType.ZOHO, name: 'Zoho CRM', oauthSupported: false },
      { type: IntegrationType.DYNAMICS, name: 'Microsoft Dynamics 365', oauthSupported: false },
      { type: IntegrationType.PIPEDRIVE, name: 'Pipedrive', oauthSupported: false },
      { type: IntegrationType.CUSTOM, name: 'Custom Integration', oauthSupported: false },
    ];
  }

  // ==================== PRIVATE METHODS ====================

  private validateScopes(scopes: string[]): void {
    const invalidScopes = scopes.filter((s) => !ALL_API_SCOPES.includes(s as ApiScope));
    if (invalidScopes.length > 0) {
      throw new ForbiddenException(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private getDefaultFieldMappings(type: IntegrationType): Record<string, Record<string, string>> {
    switch (type) {
      case IntegrationType.SALESFORCE:
        return {
          attendee: {
            email: 'Email',
            firstName: 'FirstName',
            lastName: 'LastName',
            phone: 'Phone',
            company: 'Company',
            jobTitle: 'Title',
          },
          event: {
            name: 'Name',
            startDate: 'StartDateTime',
            endDate: 'EndDateTime',
          },
        };
      case IntegrationType.HUBSPOT:
        return {
          attendee: {
            email: 'email',
            firstName: 'firstname',
            lastName: 'lastname',
            phone: 'phone',
            company: 'company',
            jobTitle: 'jobtitle',
          },
        };
      default:
        return {};
    }
  }

  private getSalesforceOAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('SALESFORCE_REDIRECT_URI');
    const baseUrl = 'https://login.salesforce.com/services/oauth2/authorize';

    return `${baseUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=${state}`;
  }

  private getHubSpotOAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('HUBSPOT_CLIENT_ID');
    const redirectUri = this.configService.get<string>('HUBSPOT_REDIRECT_URI');
    const scopes = 'crm.objects.contacts.read crm.objects.contacts.write';
    const baseUrl = 'https://app.hubspot.com/oauth/authorize';

    return `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&scope=${encodeURIComponent(scopes)}&state=${state}`;
  }
}
