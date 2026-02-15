import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Speaker } from '@event-platform/database';

@Injectable()
export class SpeakersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async create(eventId: string, dto: any): Promise<Speaker> {
    await this.verifyEventAccess(eventId);

    return this.prisma.speaker.create({
      data: {
        eventId,
        ...dto,
      },
    });
  }

  async findByEvent(eventId: string): Promise<Speaker[]> {
    return this.prisma.speaker.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<Speaker> {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        sessions: {
          include: { session: true },
        },
      },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    return speaker;
  }

  async update(id: string, dto: any): Promise<Speaker> {
    await this.findOne(id);

    return this.prisma.speaker.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.speaker.delete({ where: { id } });
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
