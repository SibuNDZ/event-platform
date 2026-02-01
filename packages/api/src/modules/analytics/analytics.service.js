"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async getDashboard(eventId) {
        await this.verifyEventAccess(eventId);
        const [event, totalAttendees, totalOrders, totalRevenue, checkIns, registrationsByDay, ticketTypeDistribution,] = await Promise.all([
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
                totalRevenue: totalRevenue._sum.total || 0,
                checkIns,
                checkInRate: totalAttendees > 0 ? (checkIns / totalAttendees) * 100 : 0,
            },
            charts: {
                registrationsByDay,
                ticketTypeDistribution,
            },
        };
    }
    async getRegistrationsByDay(eventId) {
        const results = await this.prisma.$queryRaw `
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
    async getTicketTypeDistribution(eventId) {
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
    async exportAttendees(eventId, format = 'csv') {
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
    async verifyEventAccess(eventId) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        const event = await this.prisma.event.findFirst({
            where: { id: eventId, organizationId, deletedAt: null },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map