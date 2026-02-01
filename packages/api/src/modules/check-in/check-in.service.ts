import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { CheckIn, TicketStatus } from '@event-platform/database';

export interface CheckInDto {
  qrCode: string;
  checkpointId?: string;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
  isOffline?: boolean;
}

export interface CheckInResult {
  success: boolean;
  checkIn?: CheckIn;
  attendee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    ticketType: string;
    photoUrl?: string;
  };
  message?: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: Date;
}

@Injectable()
export class CheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async checkIn(dto: CheckInDto): Promise<CheckInResult> {
    // Find ticket by QR code
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode: dto.qrCode },
      include: {
        attendee: true,
        ticketType: {
          include: { event: true },
        },
        checkIns: {
          where: dto.checkpointId
            ? { checkpointId: dto.checkpointId }
            : { checkpointId: null },
          orderBy: { checkedInAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Invalid QR code - ticket not found',
      };
    }

    // Verify ticket is valid
    if (ticket.status !== TicketStatus.ACTIVE) {
      return {
        success: false,
        message: `Ticket is ${ticket.status.toLowerCase()}`,
      };
    }

    // Check if already checked in at this checkpoint
    if (ticket.checkIns.length > 0) {
      return {
        success: false,
        message: 'Already checked in',
        alreadyCheckedIn: true,
        checkedInAt: ticket.checkIns[0]?.checkedInAt,
        attendee: {
          id: ticket.attendee.id,
          firstName: ticket.attendee.firstName,
          lastName: ticket.attendee.lastName,
          email: ticket.attendee.email,
          ticketType: ticket.ticketType.name,
          photoUrl: ticket.attendee.photoUrl || undefined,
        },
      };
    }

    // Verify checkpoint access if specified
    if (dto.checkpointId) {
      const checkpoint = await this.prisma.checkpoint.findUnique({
        where: { id: dto.checkpointId },
      });

      if (!checkpoint) {
        return {
          success: false,
          message: 'Invalid checkpoint',
        };
      }

      if (
        checkpoint.allowedTicketTypes.length > 0 &&
        !checkpoint.allowedTicketTypes.includes(ticket.ticketTypeId)
      ) {
        return {
          success: false,
          message: 'Ticket type not allowed at this checkpoint',
        };
      }
    }

    // Create check-in record
    const checkIn = await this.prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        attendeeId: ticket.attendeeId,
        checkpointId: dto.checkpointId,
        checkedInBy: this.tenantService.getUserId() || undefined,
        deviceId: dto.deviceId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isOfflineCheckIn: dto.isOffline || false,
      },
    });

    return {
      success: true,
      checkIn,
      attendee: {
        id: ticket.attendee.id,
        firstName: ticket.attendee.firstName,
        lastName: ticket.attendee.lastName,
        email: ticket.attendee.email,
        ticketType: ticket.ticketType.name,
        photoUrl: ticket.attendee.photoUrl || undefined,
      },
    };
  }

  async getCheckInStats(eventId: string) {
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

    const [totalAttendees, checkedIn, byCheckpoint] = await Promise.all([
      this.prisma.attendee.count({ where: { eventId } }),
      this.prisma.checkIn.count({
        where: { ticket: { ticketType: { eventId } } },
      }),
      this.prisma.checkIn.groupBy({
        by: ['checkpointId'],
        where: { ticket: { ticketType: { eventId } } },
        _count: { id: true },
      }),
    ]);

    return {
      totalAttendees,
      checkedIn,
      notCheckedIn: totalAttendees - checkedIn,
      checkInRate: totalAttendees > 0 ? (checkedIn / totalAttendees) * 100 : 0,
      byCheckpoint,
    };
  }

  async undoCheckIn(checkInId: string): Promise<void> {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    await this.prisma.checkIn.delete({ where: { id: checkInId } });
  }
}
