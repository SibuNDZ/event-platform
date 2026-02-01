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
exports.AttendeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let AttendeesService = class AttendeesService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async findByEvent(eventId, query = {}) {
        await this.verifyEventAccess(eventId);
        const { page = 1, perPage = 50, search } = query;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Attendee not found');
        }
        return attendee;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.attendee.update({
            where: { id },
            data: dto,
        });
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
exports.AttendeesService = AttendeesService;
exports.AttendeesService = AttendeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], AttendeesService);
//# sourceMappingURL=attendees.service.js.map