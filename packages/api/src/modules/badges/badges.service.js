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
exports.BadgesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let BadgesService = class BadgesService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async createTemplate(eventId, dto) {
        await this.verifyEventAccess(eventId);
        return this.prisma.badgeTemplate.create({
            data: {
                eventId,
                ...dto,
            },
        });
    }
    async getTemplates(eventId) {
        return this.prisma.badgeTemplate.findMany({
            where: { eventId },
        });
    }
    async getTemplate(id) {
        const template = await this.prisma.badgeTemplate.findUnique({
            where: { id },
        });
        if (!template) {
            throw new common_1.NotFoundException('Badge template not found');
        }
        return template;
    }
    async updateTemplate(id, dto) {
        await this.getTemplate(id);
        return this.prisma.badgeTemplate.update({
            where: { id },
            data: dto,
        });
    }
    async deleteTemplate(id) {
        await this.getTemplate(id);
        await this.prisma.badgeTemplate.delete({ where: { id } });
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
exports.BadgesService = BadgesService;
exports.BadgesService = BadgesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], BadgesService);
//# sourceMappingURL=badges.service.js.map