import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { TicketType } from '@event-platform/database';

@Injectable()
export class TicketTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async create(eventId: string, dto: any): Promise<TicketType> {
    await this.verifyEventAccess(eventId);

    return this.prisma.ticketType.create({
      data: {
        eventId,
        ...dto,
      },
    });
  }

  async findByEvent(eventId: string): Promise<TicketType[]> {
    return this.prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<TicketType> {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    return ticketType;
  }

  async update(id: string, dto: any): Promise<TicketType> {
    await this.findOne(id);

    return this.prisma.ticketType.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.ticketType.delete({ where: { id } });
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
