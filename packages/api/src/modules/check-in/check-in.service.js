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
exports.CheckInService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
const database_1 = require("@event-platform/database");
let CheckInService = class CheckInService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async checkIn(dto) {
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
        if (ticket.status !== database_1.TicketStatus.ACTIVE) {
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
            if (checkpoint.allowedTicketTypes.length > 0 &&
                !checkpoint.allowedTicketTypes.includes(ticket.ticketTypeId)) {
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
    async getCheckInStats(eventId) {
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
    async undoCheckIn(checkInId) {
        const checkIn = await this.prisma.checkIn.findUnique({
            where: { id: checkInId },
        });
        if (!checkIn) {
            throw new common_1.NotFoundException('Check-in not found');
        }
        await this.prisma.checkIn.delete({ where: { id: checkInId } });
    }
};
exports.CheckInService = CheckInService;
exports.CheckInService = CheckInService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], CheckInService);
//# sourceMappingURL=check-in.service.js.map