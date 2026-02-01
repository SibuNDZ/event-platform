import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { LicenseTier } from '@event-platform/database';
import { TierFeatures } from '@event-platform/shared';

// Get current tenant context from request
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

// Get current organization ID
export const OrganizationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.organizationId;
  },
);

// Require specific roles
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Require specific license tier
export const TIER_KEY = 'requiredTier';
export const RequireTier = (...tiers: LicenseTier[]) => SetMetadata(TIER_KEY, tiers);

// Require specific feature
export const FEATURE_KEY = 'requiredFeature';
export const RequireFeature = (feature: keyof TierFeatures) => SetMetadata(FEATURE_KEY, feature);
