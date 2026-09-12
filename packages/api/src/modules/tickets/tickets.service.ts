import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from '@event-platform/database';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async findByQrCode(qrCode: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        attendee: true,
        ticketType: {
          include: { event: true },
        },
        checkIns: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    this.assertOrganizationAccess(ticket.ticketType.event.organizationId);
    return ticket;
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        attendee: true,
        ticketType: {
          include: { event: true },
        },
        checkIns: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    this.assertOrganizationAccess(ticket.ticketType.event.organizationId);
    return ticket;
  }

  private assertOrganizationAccess(organizationId: string) {
    const tenantOrgId = this.tenantService.getOrganizationId();
    if (!tenantOrgId) {
      throw new ForbiddenException('Organization context required');
    }
    if (tenantOrgId !== organizationId) {
      throw new NotFoundException('Ticket not found');
    }
  }
}
