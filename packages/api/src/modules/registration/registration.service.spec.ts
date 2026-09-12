import { BadRequestException } from '@nestjs/common';
import { EventStatus } from '@event-platform/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  const prisma = {
    event: { findFirst: vi.fn() },
    attendee: { count: vi.fn() },
    order: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(),
  };
  const stripeService = {
    isConfigured: vi.fn(),
    createCheckoutSession: vi.fn(),
  };
  const emailService = { sendConfirmationEmail: vi.fn() };
  const eventEmitter = { emit: vi.fn() };
  const configService = { get: vi.fn().mockReturnValue('http://localhost:3000') };

  let service: RegistrationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RegistrationService(
      prisma as never,
      stripeService as never,
      emailService as never,
      eventEmitter as never,
      configService as never
    );
  });

  it('rejects registration for unpublished events', async () => {
    prisma.event.findFirst.mockResolvedValue({
      id: 'evt_1',
      status: EventStatus.DRAFT,
      ticketTypes: [],
    });

    await expect(
      service.register('evt_1', {
        ticketTypeId: 'tt_1',
        attendees: [{ email: 'a@test.com', firstName: 'A', lastName: 'B' }],
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('completes free registrations immediately', async () => {
    prisma.event.findFirst.mockResolvedValue({
      id: 'evt_1',
      organizationId: 'org_1',
      name: 'Summit',
      slug: 'summit',
      status: EventStatus.PUBLISHED,
      currency: 'ZAR',
      maxAttendees: null,
      ticketTypes: [
        {
          id: 'tt_1',
          isVisible: true,
          minPerOrder: 1,
          maxPerOrder: 5,
          quantity: null,
          quantitySold: 0,
          price: 0,
          currency: 'ZAR',
          attendeeType: 'GENERAL',
          salesStartDate: null,
          salesEndDate: null,
          earlyBirdPrice: null,
          earlyBirdEndDate: null,
        },
      ],
    });
    prisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
      const tx = {
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'ord_1',
            orderNumber: 'ORD-1',
            organizationId: 'org_1',
          }),
          update: vi.fn(),
        },
        attendee: {
          upsert: vi.fn().mockResolvedValue({
            id: 'att_1',
            email: 'a@test.com',
            firstName: 'A',
            lastName: 'B',
          }),
        },
        orderItem: { create: vi.fn() },
        ticket: { create: vi.fn() },
        ticketType: { findUnique: vi.fn().mockResolvedValue({ quantity: null }), update: vi.fn() },
        payment: { create: vi.fn() },
      };
      return cb(tx as never);
    });
    const pendingOrder = {
      id: 'ord_1',
      organizationId: 'org_1',
      eventId: 'evt_1',
      orderNumber: 'ORD-1',
      status: 'PENDING',
      total: 0,
      currency: 'ZAR',
      event: { id: 'evt_1', name: 'Summit', slug: 'summit' },
      items: [
        {
          id: 'item_1',
          ticketTypeId: 'tt_1',
          attendeeId: 'att_1',
          ticket: null,
          attendee: { id: 'att_1', email: 'a@test.com' },
          ticketType: { name: 'Free' },
        },
      ],
    };
    prisma.order.findUnique.mockResolvedValueOnce(pendingOrder).mockResolvedValueOnce({
      ...pendingOrder,
      status: 'COMPLETED',
      items: [
        {
          ...pendingOrder.items[0],
          ticket: { id: 'tkt_1', ticketNumber: 'TKT-1', qrCode: 'QR-1' },
        },
      ],
    });

    const result = await service.register('evt_1', {
      ticketTypeId: 'tt_1',
      attendees: [{ email: 'a@test.com', firstName: 'A', lastName: 'B' }],
    });

    expect(result.status).toBe('completed');
    expect(result.orderId).toBe('ord_1');
    expect(emailService.sendConfirmationEmail).toHaveBeenCalled();
  });

  it('requires Stripe for paid tickets when it is not configured', async () => {
    prisma.event.findFirst.mockResolvedValue({
      id: 'evt_1',
      organizationId: 'org_1',
      name: 'Summit',
      slug: 'summit',
      status: EventStatus.PUBLISHED,
      currency: 'ZAR',
      maxAttendees: null,
      ticketTypes: [
        {
          id: 'tt_1',
          isVisible: true,
          minPerOrder: 1,
          maxPerOrder: 5,
          quantity: null,
          quantitySold: 0,
          price: 250,
          currency: 'ZAR',
          attendeeType: 'GENERAL',
          salesStartDate: null,
          salesEndDate: null,
          earlyBirdPrice: null,
          earlyBirdEndDate: null,
        },
      ],
    });
    prisma.$transaction.mockResolvedValue({
      id: 'ord_1',
      orderNumber: 'ORD-1',
    });
    stripeService.isConfigured.mockReturnValue(false);

    await expect(
      service.register('evt_1', {
        ticketTypeId: 'tt_1',
        attendees: [{ email: 'a@test.com', firstName: 'A', lastName: 'B' }],
      })
    ).rejects.toThrow('Paid tickets require Stripe');
  });
});
