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
exports.TicketTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let TicketTypesService = class TicketTypesService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(eventId, dto) {
        await this.verifyEventAccess(eventId);
        return this.prisma.ticketType.create({
            data: {
                eventId,
                ...dto,
            },
        });
    }
    async findByEvent(eventId) {
        return this.prisma.ticketType.findMany({
            where: { eventId },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findOne(id) {
        const ticketType = await this.prisma.ticketType.findUnique({
            where: { id },
        });
        if (!ticketType) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        return ticketType;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.ticketType.update({
            where: { id },
            data: dto,
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.ticketType.delete({ where: { id } });
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
exports.TicketTypesService = TicketTypesService;
exports.TicketTypesService = TicketTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], TicketTypesService);
//# sourceMappingURL=ticket-types.service.js.map