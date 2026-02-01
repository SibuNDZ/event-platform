import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';

interface DashboardResponse {
  event: {
    id: string | undefined;
    name: string | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    status: string | undefined;
  };
  stats: {
    totalAttendees: number;
    totalOrders: number;
    totalRevenue: number;
    checkIns: number;
    checkInRate: number;
  };
  charts: {
    registrationsByDay: Array<{ date: Date; count: number }>;
    ticketTypeDistribution: Array<{ ticketType: string; count: number }>;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async getDashboard(eventId: string): Promise<DashboardResponse> {
    await this.verifyEventAccess(eventId);

    const [
      event,
      totalAttendees,
      totalOrders,
      totalRevenue,
      checkIns,
      registrationsByDay,
      ticketTypeDistribution,
    ] = await Promise.all([
      this.prisma.event.findUnique({ where: { id: eventId } }),
      this.prisma.attendee.count({ where: { eventId } }),
      this.prisma.order.count({ where: { eventId, status: 'COMPLETED' } }),
      this.prisma.order.aggregate({
        where: { eventId, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      this.prisma.checkIn.count({
        where: { ticket: { ticketType: { eventId } } },
      }),
      this.getRegistrationsByDay(eventId),
      this.getTicketTypeDistribution(eventId),
    ]);

    return {
      event: {
        id: event?.id,
        name: event?.name,
        startDate: event?.startDate,
        endDate: event?.endDate,
        status: event?.status,
      },
      stats: {
        totalAttendees,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        checkIns,
        checkInRate: totalAttendees > 0 ? (checkIns / totalAttendees) * 100 : 0,
      },
      charts: {
        registrationsByDay,
        ticketTypeDistribution,
      },
    };
  }

  private async getRegistrationsByDay(eventId: string) {
    const results = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM attendees
      WHERE event_id = ${eventId}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return results.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  private async getTicketTypeDistribution(eventId: string) {
    const results = await this.prisma.orderItem.groupBy({
      by: ['ticketTypeId'],
      where: {
        order: { eventId, status: 'COMPLETED' },
      },
      _sum: { quantity: true },
    });

    const ticketTypes = await this.prisma.ticketType.findMany({
      where: { id: { in: results.map((r) => r.ticketTypeId) } },
    });

    return results.map((r) => ({
      ticketType: ticketTypes.find((t) => t.id === r.ticketTypeId)?.name || 'Unknown',
      count: r._sum.quantity || 0,
    }));
  }

  async exportAttendees(eventId: string, format: 'csv' | 'xlsx' = 'csv') {
    await this.verifyEventAccess(eventId);

    const attendees = await this.prisma.attendee.findMany({
      where: { eventId },
      include: {
        tickets: {
          include: { ticketType: true },
        },
        checkIns: {
          orderBy: { checkedInAt: 'desc' },
          take: 1,
        },
      },
    });

    // Convert to CSV format
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Company',
      'Job Title',
      'Ticket Type',
      'Checked In',
      'Check-In Time',
    ];

    const rows = attendees.map((a) => [
      a.email,
      a.firstName,
      a.lastName,
      a.company || '',
      a.jobTitle || '',
      a.tickets[0]?.ticketType.name || '',
      a.checkIns.length > 0 ? 'Yes' : 'No',
      a.checkIns[0]?.checkedInAt?.toISOString() || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return {
      filename: `attendees-${eventId}.csv`,
      content: csv,
      contentType: 'text/csv',
    };
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
