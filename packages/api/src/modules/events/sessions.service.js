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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let SessionsService = class SessionsService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        // Verify event belongs to organization
        await this.verifyEventAccess(dto.eventId);
        return this.prisma.eventSession.create({
            data: {
                eventId: dto.eventId,
                title: dto.title,
                description: dto.description,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                track: dto.track,
                roomName: dto.roomName,
                capacity: dto.capacity,
            },
        });
    }
    async findByEvent(eventId) {
        await this.verifyEventAccess(eventId);
        return this.prisma.eventSession.findMany({
            where: { eventId },
            orderBy: { startTime: 'asc' },
            include: {
                speakers: {
                    include: { speaker: true },
                },
            },
        });
    }
    async findOne(id) {
        const session = await this.prisma.eventSession.findUnique({
            where: { id },
            include: {
                event: true,
                speakers: {
                    include: { speaker: true },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.verifyEventAccess(session.eventId);
        return session;
    }
    async update(id, dto) {
        const session = await this.findOne(id);
        return this.prisma.eventSession.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.startTime && { startTime: new Date(dto.startTime) }),
                ...(dto.endTime && { endTime: new Date(dto.endTime) }),
                ...(dto.track !== undefined && { track: dto.track }),
                ...(dto.roomName !== undefined && { roomName: dto.roomName }),
                ...(dto.capacity !== undefined && { capacity: dto.capacity }),
            },
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.eventSession.delete({ where: { id } });
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
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map