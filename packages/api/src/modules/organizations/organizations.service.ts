import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Organization } from '@event-platform/database';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async getCurrent(): Promise<Organization> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(data: {
    name?: string;
    logoUrl?: string;
    website?: string;
    websiteUrl?: string;
    timezone?: string;
    currency?: string;
    locale?: string;
  }): Promise<Organization> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.website !== undefined && { websiteUrl: data.website }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.locale !== undefined && { locale: data.locale }),
      },
    });
  }

  async getMembers(): Promise<object[]> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            status: true,
          },
        },
      },
    });
  }
}
