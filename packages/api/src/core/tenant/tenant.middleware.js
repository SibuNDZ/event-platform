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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const prisma_service_1 = require("../database/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    tenantService;
    prisma;
    constructor(tenantService, prisma) {
        this.tenantService = tenantService;
        this.prisma = prisma;
    }
    async use(req, res, next) {
        // Extract tenant info from JWT payload (set by auth guard)
        const user = req.user;
        if (user && user.organizationId) {
            try {
                // Fetch organization details
                const organization = await this.prisma.organization.findUnique({
                    where: { id: user.organizationId },
                });
                if (!organization) {
                    throw new common_1.UnauthorizedException('Organization not found');
                }
                if (organization.deletedAt) {
                    throw new common_1.UnauthorizedException('Organization has been deleted');
                }
                // Get user's role in the organization
                const membership = await this.prisma.organizationMember.findUnique({
                    where: {
                        organizationId_userId: {
                            organizationId: user.organizationId,
                            userId: user.sub,
                        },
                    },
                });
                if (!membership) {
                    throw new common_1.UnauthorizedException('User is not a member of this organization');
                }
                // Set tenant context
                this.tenantService.setContext({
                    organizationId: organization.id,
                    organization,
                    userId: user.sub,
                    role: membership.role,
                });
                // Attach to request for easy access
                req.tenant = {
                    organizationId: organization.id,
                    userId: user.sub,
                    role: membership.role,
                };
            }
            catch (error) {
                if (error instanceof common_1.UnauthorizedException) {
                    throw error;
                }
                // Log error but don't block - let guards handle authorization
            }
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService,
        prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map