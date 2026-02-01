"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireFeature = exports.FEATURE_KEY = exports.RequireTier = exports.TIER_KEY = exports.Roles = exports.ROLES_KEY = exports.OrganizationId = exports.CurrentTenant = void 0;
const common_1 = require("@nestjs/common");
// Get current tenant context from request
exports.CurrentTenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
});
// Get current organization ID
exports.OrganizationId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.organizationId;
});
// Require specific roles
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
// Require specific license tier
exports.TIER_KEY = 'requiredTier';
const RequireTier = (...tiers) => (0, common_1.SetMetadata)(exports.TIER_KEY, tiers);
exports.RequireTier = RequireTier;
// Require specific feature
exports.FEATURE_KEY = 'requiredFeature';
const RequireFeature = (feature) => (0, common_1.SetMetadata)(exports.FEATURE_KEY, feature);
exports.RequireFeature = RequireFeature;
//# sourceMappingURL=tenant.decorator.js.map