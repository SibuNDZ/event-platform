import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EventStatus,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  TicketStatus,
} from '@event-platform/database';
import { PrismaService } from '../../core/database/prisma.service';
import { EventEmitterService } from '../../core/events/event-emitter.service';
import { EmailService } from '../communications/email.service';
import { StripeService } from '../payments/stripe.service';
import { WEBHOOK_EVENTS } from '../webhooks/webhook-events.constants';
import { RegisterForEventDto } from './dto/registration.dto';

export interface FulfillOrderOptions {
  provider: PaymentProvider;
  providerPaymentId?: string;
}

export interface RegistrationOrderResult {
  status: 'completed' | 'pending' | 'requires_payment';
  orderId: string;
  orderNumber: string;
  orderStatus?: string;
  checkoutUrl?: string | null;
  event?: {
    id: string;
    name: string;
    slug: string;
    startDate: Date;
    venueName: string | null;
  };
  tickets?: Array<{
    id: string;
    ticketNumber: string;
    qrCode: string;
  } | null>;
  attendees?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null>;
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitterService,
    private readonly configService: ConfigService
  ) {}

  async register(eventId: string, dto: RegisterForEventDto): Promise<RegistrationOrderResult> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for registration');
    }

    const ticketType = event.ticketTypes.find((type) => type.id === dto.ticketTypeId);
    if (!ticketType || !ticketType.isVisible) {
      throw new BadRequestException('Invalid ticket type');
    }

    const quantity = dto.attendees.length;
    if (quantity < ticketType.minPerOrder || quantity > ticketType.maxPerOrder) {
      throw new BadRequestException(
        `This ticket requires between ${ticketType.minPerOrder} and ${ticketType.maxPerOrder} attendees`
      );
    }

    const now = new Date();
    if (ticketType.salesStartDate && now < ticketType.salesStartDate) {
      throw new BadRequestException('Ticket sales have not started');
    }
    if (ticketType.salesEndDate && now > ticketType.salesEndDate) {
      throw new BadRequestException('Ticket sales have ended');
    }

    if (ticketType.quantity != null && ticketType.quantitySold + quantity > ticketType.quantity) {
      throw new BadRequestException('Not enough tickets available');
    }

    if (event.maxAttendees) {
      const attendeeCount = await this.prisma.attendee.count({ where: { eventId } });
      if (attendeeCount + quantity > event.maxAttendees) {
        throw new BadRequestException('Event is at capacity');
      }
    }

    const unitPrice = this.resolveUnitPrice(ticketType, now);
    const subtotal = unitPrice * quantity;
    const currency = ticketType.currency || event.currency || 'ZAR';
    const primary = dto.attendees[0]!;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          eventId: event.id,
          organizationId: event.organizationId,
          orderNumber: this.generateOrderNumber(),
          customerEmail: primary.email.toLowerCase(),
          customerFirstName: primary.firstName,
          customerLastName: primary.lastName,
          customerPhone: primary.phone,
          subtotal,
          total: subtotal,
          currency,
          status: OrderStatus.PENDING,
        },
      });

      for (const attendeeDto of dto.attendees) {
        const attendee = await tx.attendee.upsert({
          where: {
            eventId_email: {
              eventId: event.id,
              email: attendeeDto.email.toLowerCase(),
            },
          },
          create: {
            eventId: event.id,
            email: attendeeDto.email.toLowerCase(),
            firstName: attendeeDto.firstName,
            lastName: attendeeDto.lastName,
            phone: attendeeDto.phone,
            company: attendeeDto.company,
            jobTitle: attendeeDto.jobTitle,
            attendeeType: ticketType.attendeeType,
          },
          update: {
            firstName: attendeeDto.firstName,
            lastName: attendeeDto.lastName,
            phone: attendeeDto.phone,
            company: attendeeDto.company,
            jobTitle: attendeeDto.jobTitle,
          },
        });

        await tx.orderItem.create({
          data: {
            orderId: created.id,
            ticketTypeId: ticketType.id,
            attendeeId: attendee.id,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
            attendeeEmail: attendee.email,
            attendeeFirstName: attendee.firstName,
            attendeeLastName: attendee.lastName,
          },
        });
      }

      return created;
    });

    this.eventEmitter.emit({
      organizationId: event.organizationId,
      eventType: WEBHOOK_EVENTS.ORDER_CREATED,
      data: { orderId: order.id, orderNumber: order.orderNumber, total: subtotal, currency },
      metadata: { eventId: event.id },
    });

    if (subtotal <= 0) {
      return this.fulfillOrder(order.id, { provider: PaymentProvider.FREE });
    }

    if (!this.stripeService.isConfigured()) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
      throw new BadRequestException(
        'Paid tickets require Stripe. Configure STRIPE_SECRET_KEY or use a free ticket.'
      );
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const session = await this.stripeService.createCheckoutSession({
      mode: 'payment',
      customer_email: primary.email.toLowerCase(),
      success_url: `${frontendUrl}/e/${event.slug}/confirmed?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/e/${event.slug}?canceled=1`,
      line_items: [
        {
          quantity,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: `${event.name} — ${ticketType.name}`,
            },
          },
        },
      ],
      metadata: {
        orderId: order.id,
        eventId: event.id,
      },
    });

    return {
      status: 'requires_payment' as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl: session.url,
    };
  }

  async fulfillOrder(
    orderId: string,
    options: FulfillOrderOptions
  ): Promise<RegistrationOrderResult> {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        items: {
          include: {
            attendee: true,
            ticketType: true,
            ticket: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (existing.status === OrderStatus.COMPLETED) {
      return this.getOrderResult(orderId);
    }

    if (existing.status === OrderStatus.FAILED || existing.status === OrderStatus.REFUNDED) {
      throw new BadRequestException('Order cannot be completed');
    }

    const quantity = existing.items.length;
    const ticketTypeId = existing.items[0]?.ticketTypeId;
    if (!ticketTypeId) {
      throw new BadRequestException('Order has no items');
    }

    await this.prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findUnique({ where: { id: ticketTypeId } });
      if (
        ticketType?.quantity != null &&
        ticketType.quantitySold + quantity > ticketType.quantity
      ) {
        throw new BadRequestException('Not enough tickets available');
      }

      for (const item of existing.items) {
        if (item.ticket || !item.attendeeId) {
          continue;
        }

        await tx.ticket.create({
          data: {
            ticketTypeId: item.ticketTypeId,
            orderItemId: item.id,
            attendeeId: item.attendeeId,
            ticketNumber: this.generateTicketNumber(),
            qrCode: this.generateQrCode(),
            status: TicketStatus.ACTIVE,
          },
        });
      }

      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { quantitySold: { increment: quantity } },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.payment.create({
        data: {
          orderId,
          amount: existing.total,
          currency: existing.currency,
          provider: options.provider,
          providerPaymentId: options.providerPaymentId,
          status: PaymentStatus.SUCCEEDED,
          paidAt: new Date(),
        },
      });
    });

    const result = await this.getOrderResult(orderId);

    this.eventEmitter.emit({
      organizationId: existing.organizationId,
      eventType: WEBHOOK_EVENTS.ORDER_COMPLETED,
      data: { orderId: existing.id, orderNumber: existing.orderNumber },
      metadata: { eventId: existing.eventId },
    });

    for (const attendee of result.attendees || []) {
      if (!attendee) continue;
      this.eventEmitter.emit({
        organizationId: existing.organizationId,
        eventType: WEBHOOK_EVENTS.ATTENDEE_CREATED,
        data: {
          attendeeId: attendee.id,
          email: attendee.email,
          eventId: existing.eventId,
        },
        metadata: { eventId: existing.eventId },
      });
    }
    for (const ticket of result.tickets || []) {
      if (!ticket) continue;
      this.eventEmitter.emit({
        organizationId: existing.organizationId,
        eventType: WEBHOOK_EVENTS.TICKET_CREATED,
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
        },
        metadata: { eventId: existing.eventId },
      });
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    await Promise.all(
      (result.attendees || [])
        .filter((attendee): attendee is NonNullable<typeof attendee> => Boolean(attendee))
        .map((attendee) =>
          this.emailService.sendConfirmationEmail(
            attendee.email,
            existing.event.name,
            `${frontendUrl}/e/${existing.event.slug}/confirmed?orderId=${existing.id}`
          )
        )
    );

    return result;
  }

  async getOrderResult(orderId: string): Promise<RegistrationOrderResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            venueName: true,
          },
        },
        items: {
          include: {
            attendee: true,
            ticketType: true,
            ticket: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      status:
        order.status === OrderStatus.COMPLETED ? ('completed' as const) : ('pending' as const),
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      event: order.event,
      tickets: order.items
        .map((item) => item.ticket)
        .filter(Boolean)
        .map((ticket) => ({
          id: ticket!.id,
          ticketNumber: ticket!.ticketNumber,
          qrCode: ticket!.qrCode,
        })),
      attendees: order.items
        .map((item) => item.attendee)
        .filter(Boolean)
        .map((attendee) => ({
          id: attendee!.id,
          email: attendee!.email,
          firstName: attendee!.firstName,
          lastName: attendee!.lastName,
        })),
    };
  }

  private resolveUnitPrice(
    ticketType: { price: unknown; earlyBirdPrice?: unknown; earlyBirdEndDate?: Date | null },
    now: Date
  ): number {
    const regular = Number(ticketType.price);
    if (
      ticketType.earlyBirdPrice != null &&
      ticketType.earlyBirdEndDate &&
      now <= ticketType.earlyBirdEndDate
    ) {
      return Number(ticketType.earlyBirdPrice);
    }
    return regular;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private generateTicketNumber(): string {
    return `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  private generateQrCode(): string {
    return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
  }
}
