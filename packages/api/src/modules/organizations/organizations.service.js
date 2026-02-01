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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
let OrganizationsService = class OrganizationsService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async getCurrent() {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async update(data) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        return this.prisma.organization.update({
            where: { id: organizationId },
            data,
        });
    }
    async getMembers() {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        return this.prisma.organizationMember.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        status: true,
                    },
                },
            },
        });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map