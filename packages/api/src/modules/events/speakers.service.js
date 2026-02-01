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
exports.SpeakersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let SpeakersService = class SpeakersService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(eventId, dto) {
        await this.verifyEventAccess(eventId);
        return this.prisma.speaker.create({
            data: {
                eventId,
                ...dto,
            },
        });
    }
    async findByEvent(eventId) {
        return this.prisma.speaker.findMany({
            where: { eventId },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findOne(id) {
        const speaker = await this.prisma.speaker.findUnique({
            where: { id },
            include: {
                sessions: {
                    include: { session: true },
                },
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException('Speaker not found');
        }
        return speaker;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.speaker.update({
            where: { id },
            data: dto,
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.speaker.delete({ where: { id } });
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
exports.SpeakersService = SpeakersService;
exports.SpeakersService = SpeakersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], SpeakersService);
//# sourceMappingURL=speakers.service.js.map