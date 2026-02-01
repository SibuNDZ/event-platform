import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { BadgeTemplate } from '@event-platform/database';

@Injectable()
export class BadgesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async createTemplate(eventId: string, dto: any): Promise<BadgeTemplate> {
    await this.verifyEventAccess(eventId);

    return this.prisma.badgeTemplate.create({
      data: {
        eventId,
        ...dto,
      },
    });
  }

  async getTemplates(eventId: string): Promise<BadgeTemplate[]> {
    return this.prisma.badgeTemplate.findMany({
      where: { eventId },
    });
  }

  async getTemplate(id: string): Promise<BadgeTemplate> {
    const template = await this.prisma.badgeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Badge template not found');
    }

    return template;
  }

  async updateTemplate(id: string, dto: any): Promise<BadgeTemplate> {
    await this.getTemplate(id);

    return this.prisma.badgeTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.getTemplate(id);
    await this.prisma.badgeTemplate.delete({ where: { id } });
  }

  private async verifyEventAccess(eventId: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }
}
