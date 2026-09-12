import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@event-platform/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketTypesService } from './ticket-types.service';

describe('TicketTypesService.delete', () => {
  const tx = {
    order: { deleteMany: vi.fn() },
    attendee: { deleteMany: vi.fn() },
    ticketType: { delete: vi.fn() },
  };
  const prisma = {
    event: { findFirst: vi.fn() },
    ticketType: { findFirst: vi.fn() },
    orderItem: { findMany: vi.fn() },
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<void>) => fn(tx)),
  };
  const tenantService = { getOrganizationId: vi.fn().mockReturnValue('org_1') };

  let service: TicketTypesService;

  beforeEach(() => {
    vi.clearAllMocks();
    tenantService.getOrganizationId.mockReturnValue('org_1');
    prisma.event.findFirst.mockResolvedValue({ id: 'evt_1', currency: 'ZAR' });
    prisma.ticketType.findFirst.mockResolvedValue({ id: 'tt_1', eventId: 'evt_1' });
    service = new TicketTypesService(prisma as never, tenantService as never);
  });

  it('deletes a ticket type nobody has registered for', async () => {
    prisma.orderItem.findMany.mockResolvedValue([]);

    await service.delete('evt_1', 'tt_1');

    expect(tx.order.deleteMany).not.toHaveBeenCalled();
    expect(tx.attendee.deleteMany).not.toHaveBeenCalled();
    expect(tx.ticketType.delete).toHaveBeenCalledWith({ where: { id: 'tt_1' } });
  });

  it('cleans up abandoned registrations along with the ticket type', async () => {
    prisma.orderItem.findMany.mockResolvedValue([
      {
        orderId: 'ord_failed',
        attendeeId: 'att_1',
        order: { status: OrderStatus.FAILED },
        ticket: null,
      },
      {
        orderId: 'ord_pending',
        attendeeId: null,
        order: { status: OrderStatus.PENDING },
        ticket: null,
      },
    ]);

    await service.delete('evt_1', 'tt_1');

    expect(tx.order.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['ord_failed', 'ord_pending'] } },
    });
    expect(tx.attendee.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['att_1'] }, orderItems: { none: {} } },
    });
    expect(tx.ticketType.delete).toHaveBeenCalledWith({ where: { id: 'tt_1' } });
  });

  it('refuses to delete a ticket type with completed orders', async () => {
    prisma.orderItem.findMany.mockResolvedValue([
      {
        orderId: 'ord_done',
        attendeeId: 'att_1',
        order: { status: OrderStatus.COMPLETED },
        ticket: { id: 'tkt_1' },
      },
    ]);

    await expect(service.delete('evt_1', 'tt_1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
