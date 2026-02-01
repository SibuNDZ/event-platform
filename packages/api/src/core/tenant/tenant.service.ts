import { Injectable, Scope } from '@nestjs/common';
import { Organization, LicenseTier } from '@event-platform/database';
import { TIER_FEATURES, TierFeatures } from '@event-platform/shared';

export interface TenantContext {
  organizationId: string;
  organization?: Organization;
  userId?: string;
  role?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private context: TenantContext | null = null;

  setContext(context: TenantContext) {
    this.context = context;
  }

  getContext(): TenantContext | null {
    return this.context;
  }

  getOrganizationId(): string | null {
    return this.context?.organizationId || null;
  }

  getUserId(): string | null {
    return this.context?.userId || null;
  }

  getRole(): string | null {
    return this.context?.role || null;
  }

  getOrganization(): Organization | null {
    return this.context?.organization || null;
  }

  getTierFeatures(): TierFeatures | null {
    const org = this.context?.organization;
    if (!org) return null;
    return TIER_FEATURES[org.licenseTier as keyof typeof TIER_FEATURES] || TIER_FEATURES.STANDARD;
  }

  hasFeature(feature: keyof TierFeatures): boolean {
    const features = this.getTierFeatures();
    if (!features) return false;

    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value !== 'none';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }

  isOwner(): boolean {
    return this.context?.role === 'OWNER';
  }

  isAdmin(): boolean {
    return this.context?.role === 'OWNER' || this.context?.role === 'ADMIN';
  }

  isStaff(): boolean {
    return this.isAdmin() || this.context?.role === 'STAFF';
  }

  canManageOrganization(): boolean {
    return this.isOwner();
  }

  canManageEvents(): boolean {
    return this.isAdmin();
  }

  canManageAttendees(): boolean {
    return this.isStaff();
  }

  canViewOnly(): boolean {
    return this.context?.role === 'VIEWER';
  }
}
