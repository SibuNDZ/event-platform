import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from './tenant.service';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private tenantService;
    constructor(reflector: Reflector, tenantService: TenantService);
    canActivate(context: ExecutionContext): boolean;
}
export declare class TierGuard implements CanActivate {
    private reflector;
    private tenantService;
    constructor(reflector: Reflector, tenantService: TenantService);
    canActivate(context: ExecutionContext): boolean;
}
export declare class FeatureGuard implements CanActivate {
    private reflector;
    private tenantService;
    constructor(reflector: Reflector, tenantService: TenantService);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=tenant.guard.d.ts.map