import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Attendee, Prisma } from '@event-platform/database';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { UpdateAttendeeDto } from './dto/attendee.dto';

@Injectable()
export class AttendeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async findByEvent(
    eventId: string,
    query: { page?: number; perPage?: number; search?: string } = {}
  ) {
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
          tickets: {
            include: { ticketType: true },
          },
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

  async findOne(eventId: string, id: string): Promise<Attendee> {
    await this.verifyEventAccess(eventId);

    const attendee = await this.prisma.attendee.findFirst({
      where: { id, eventId },
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

  async update(eventId: string, id: string, dto: UpdateAttendeeDto): Promise<Attendee> {
    await this.findOne(eventId, id);

    return this.prisma.attendee.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.isApproved !== undefined && { isApproved: dto.isApproved }),
      },
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
