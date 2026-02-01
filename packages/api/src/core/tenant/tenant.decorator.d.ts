import { LicenseTier } from '@event-platform/database';
import { TierFeatures } from '@event-platform/shared';
export declare const CurrentTenant: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const OrganizationId: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const TIER_KEY = "requiredTier";
export declare const RequireTier: (...tiers: LicenseTier[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const FEATURE_KEY = "requiredFeature";
export declare const RequireFeature: (feature: keyof TierFeatures) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=tenant.decorator.d.ts.map