import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, TicketType } from '@event-platform/database';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/ticket-type.dto';
import { normalizeCurrency } from '../../common/currency';

@Injectable()
export class TicketTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async create(eventId: string, dto: CreateTicketTypeDto): Promise<TicketType> {
    const event = await this.verifyEventAccess(eventId);

    return this.prisma.ticketType.create({
      data: {
        eventId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: normalizeCurrency(dto.currency) || normalizeCurrency(event.currency) || 'ZAR',
        quantity: dto.quantity,
        maxPerOrder: dto.maxPerOrder ?? 10,
        minPerOrder: dto.minPerOrder ?? 1,
        attendeeType: dto.attendeeType,
        isVisible: dto.isVisible ?? true,
        salesStartDate: dto.salesStartDate ? new Date(dto.salesStartDate) : undefined,
        salesEndDate: dto.salesEndDate ? new Date(dto.salesEndDate) : undefined,
        earlyBirdPrice: dto.earlyBirdPrice,
        earlyBirdEndDate: dto.earlyBirdEndDate ? new Date(dto.earlyBirdEndDate) : undefined,
      },
    });
  }

  async findByEvent(eventId: string): Promise<TicketType[]> {
    await this.verifyEventAccess(eventId);

    return this.prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(eventId: string, id: string): Promise<TicketType> {
    await this.verifyEventAccess(eventId);

    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id, eventId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    return ticketType;
  }

  async update(eventId: string, id: string, dto: UpdateTicketTypeDto): Promise<TicketType> {
    await this.findOne(eventId, id);

    return this.prisma.ticketType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: normalizeCurrency(dto.currency) }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.maxPerOrder !== undefined && { maxPerOrder: dto.maxPerOrder }),
        ...(dto.minPerOrder !== undefined && { minPerOrder: dto.minPerOrder }),
        ...(dto.attendeeType !== undefined && { attendeeType: dto.attendeeType }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        ...(dto.salesStartDate !== undefined && { salesStartDate: new Date(dto.salesStartDate) }),
        ...(dto.salesEndDate !== undefined && { salesEndDate: new Date(dto.salesEndDate) }),
        ...(dto.earlyBirdPrice !== undefined && { earlyBirdPrice: dto.earlyBirdPrice }),
        ...(dto.earlyBirdEndDate !== undefined && {
          earlyBirdEndDate: new Date(dto.earlyBirdEndDate),
        }),
      },
    });
  }

  /**
   * Order items reference ticket types without a cascade, so a plain delete
   * fails once anyone has started a registration. Abandoned registrations
   * (orders still PENDING or FAILED, no ticket issued) are cleaned up with the
   * ticket type; anything that produced a ticket blocks the delete.
   */
  async delete(eventId: string, id: string): Promise<void> {
    await this.findOne(eventId, id);

    const items = await this.prisma.orderItem.findMany({
      where: { ticketTypeId: id },
      select: {
        orderId: true,
        attendeeId: true,
        order: { select: { status: true } },
        ticket: { select: { id: true } },
      },
    });

    const abandonedStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.FAILED];
    const blocking = items.filter(
      (item) => item.ticket || !abandonedStatuses.includes(item.order.status)
    );
    if (blocking.length > 0) {
      throw new BadRequestException(
        'This ticket type has completed orders and cannot be deleted. Hide it instead.'
      );
    }

    const orderIds = [...new Set(items.map((item) => item.orderId))];
    const attendeeIds = [
      ...new Set(items.map((item) => item.attendeeId).filter((v): v is string => Boolean(v))),
    ];

    await this.prisma.$transaction(async (tx) => {
      if (orderIds.length > 0) {
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
      }
      if (attendeeIds.length > 0) {
        // Only attendees that no longer belong to any order.
        await tx.attendee.deleteMany({
          where: { id: { in: attendeeIds }, orderItems: { none: {} } },
        });
      }
      await tx.ticketType.delete({ where: { id } });
    });
  }

  private async verifyEventAccess(eventId: string) {
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

    return event;
  }
}
