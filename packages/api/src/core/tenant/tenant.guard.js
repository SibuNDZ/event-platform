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
exports.FeatureGuard = exports.TierGuard = exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_service_1 = require("./tenant.service");
const tenant_decorator_1 = require("./tenant.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    tenantService;
    constructor(reflector, tenantService) {
        this.reflector = reflector;
        this.tenantService = tenantService;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(tenant_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const role = this.tenantService.getRole();
        if (!role) {
            throw new common_1.ForbiddenException('No role assigned');
        }
        // Role hierarchy: OWNER > ADMIN > STAFF > VIEWER
        const roleHierarchy = ['VIEWER', 'STAFF', 'ADMIN', 'OWNER'];
        const userRoleIndex = roleHierarchy.indexOf(role);
        const hasRole = requiredRoles.some((requiredRole) => {
            const requiredIndex = roleHierarchy.indexOf(requiredRole);
            return userRoleIndex >= requiredIndex;
        });
        if (!hasRole) {
            throw new common_1.ForbiddenException('Insufficient role permissions');
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenant_service_1.TenantService])
], RolesGuard);
let TierGuard = class TierGuard {
    reflector;
    tenantService;
    constructor(reflector, tenantService) {
        this.reflector = reflector;
        this.tenantService = tenantService;
    }
    canActivate(context) {
        const requiredTiers = this.reflector.getAllAndOverride(tenant_decorator_1.TIER_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredTiers || requiredTiers.length === 0) {
            return true;
        }
        const organization = this.tenantService.getOrganization();
        if (!organization) {
            throw new common_1.ForbiddenException('No organization context');
        }
        // Tier hierarchy: STANDARD < PROFESSIONAL < ENTERPRISE
        const tierHierarchy = ['STANDARD', 'PROFESSIONAL', 'ENTERPRISE'];
        const orgTierIndex = tierHierarchy.indexOf(organization.licenseTier);
        const hasTier = requiredTiers.some((requiredTier) => {
            const requiredIndex = tierHierarchy.indexOf(requiredTier);
            return orgTierIndex >= requiredIndex;
        });
        if (!hasTier) {
            throw new common_1.ForbiddenException(`This feature requires ${requiredTiers.join(' or ')} tier. Please upgrade your plan.`);
        }
        return true;
    }
};
exports.TierGuard = TierGuard;
exports.TierGuard = TierGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenant_service_1.TenantService])
], TierGuard);
let FeatureGuard = class FeatureGuard {
    reflector;
    tenantService;
    constructor(reflector, tenantService) {
        this.reflector = reflector;
        this.tenantService = tenantService;
    }
    canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(tenant_decorator_1.FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredFeature) {
            return true;
        }
        const hasFeature = this.tenantService.hasFeature(requiredFeature);
        if (!hasFeature) {
            throw new common_1.ForbiddenException(`This feature (${requiredFeature}) is not available in your current plan. Please upgrade.`);
        }
        return true;
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenant_service_1.TenantService])
], FeatureGuard);
//# sourceMappingURL=tenant.guard.js.map