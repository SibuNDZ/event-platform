import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from './tenant.service';
import { ROLES_KEY, TIER_KEY, FEATURE_KEY } from './tenant.decorator';
import { LicenseTier } from '@event-platform/database';
import { TierFeatures } from '@event-platform/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantService: TenantService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const role = this.tenantService.getRole();
    if (!role) {
      throw new ForbiddenException('No role assigned');
    }

    // Role hierarchy: OWNER > ADMIN > STAFF > VIEWER
    const roleHierarchy = ['VIEWER', 'STAFF', 'ADMIN', 'OWNER'];
    const userRoleIndex = roleHierarchy.indexOf(role);

    const hasRole = requiredRoles.some((requiredRole) => {
      const requiredIndex = roleHierarchy.indexOf(requiredRole);
      return userRoleIndex >= requiredIndex;
    });

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantService: TenantService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTiers = this.reflector.getAllAndOverride<LicenseTier[]>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    const organization = this.tenantService.getOrganization();
    if (!organization) {
      throw new ForbiddenException('No organization context');
    }

    // Tier hierarchy: STANDARD < PROFESSIONAL < ENTERPRISE
    const tierHierarchy: LicenseTier[] = ['STANDARD', 'PROFESSIONAL', 'ENTERPRISE'];
    const orgTierIndex = tierHierarchy.indexOf(organization.licenseTier);

    const hasTier = requiredTiers.some((requiredTier) => {
      const requiredIndex = tierHierarchy.indexOf(requiredTier);
      return orgTierIndex >= requiredIndex;
    });

    if (!hasTier) {
      throw new ForbiddenException(
        `This feature requires ${requiredTiers.join(' or ')} tier. Please upgrade your plan.`
      );
    }

    return true;
  }
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantService: TenantService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<keyof TierFeatures>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const hasFeature = this.tenantService.hasFeature(requiredFeature);

    if (!hasFeature) {
      throw new ForbiddenException(
        `This feature (${requiredFeature}) is not available in your current plan. Please upgrade.`
      );
    }

    return true;
  }
}
