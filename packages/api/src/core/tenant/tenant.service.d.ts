import { Organization } from '@event-platform/database';
import { TierFeatures } from '@event-platform/shared';
export interface TenantContext {
    organizationId: string;
    organization?: Organization;
    userId?: string;
    role?: string;
}
export declare class TenantService {
    private context;
    setContext(context: TenantContext): void;
    getContext(): TenantContext | null;
    getOrganizationId(): string | null;
    getUserId(): string | null;
    getRole(): string | null;
    getOrganization(): Organization | null;
    getTierFeatures(): TierFeatures | null;
    hasFeature(feature: keyof TierFeatures): boolean;
    isOwner(): boolean;
    isAdmin(): boolean;
    isStaff(): boolean;
    canManageOrganization(): boolean;
    canManageEvents(): boolean;
    canManageAttendees(): boolean;
    canViewOnly(): boolean;
}
//# sourceMappingURL=tenant.service.d.ts.map