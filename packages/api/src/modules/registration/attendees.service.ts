import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Attendee, Prisma } from '@event-platform/database';

@Injectable()
export class AttendeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async findByEvent(eventId: string, query: any = {}) {
    await this.verifyEventAccess(eventId);

    const { page = 1, perPage = 50, search } = query;

    const where: Prisma.AttendeeWhereInput = {
      eventId,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [attendees, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          tickets: true,
          checkIns: {
            orderBy: { checkedInAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where }),
    ]);

    return {
      items: attendees,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string): Promise<Attendee> {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: {
        tickets: {
          include: { ticketType: true },
        },
        checkIns: true,
        orderItems: {
          include: { order: true },
        },
      },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return attendee;
  }

  async update(id: string, dto: any): Promise<Attendee> {
    await this.findOne(id);

    return this.prisma.attendee.update({
      where: { id },
      data: dto,
    });
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
