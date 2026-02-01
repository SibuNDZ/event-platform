import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Ticket } from '@event-platform/database';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return ticket;
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        attendee: true,
        ticketType: true,
        checkIns: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }
}
