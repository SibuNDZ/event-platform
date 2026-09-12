import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantMiddleware } from './tenant.middleware';
import { TenantContextGuard } from './tenant-context.guard';
import { FeatureGuard, RolesGuard, TierGuard } from './tenant.guard';

@Global()
@Module({
  providers: [TenantService, TenantContextGuard, RolesGuard, TierGuard, FeatureGuard],
  exports: [TenantService, TenantContextGuard, RolesGuard, TierGuard, FeatureGuard],
})
export class TenantModule {}

export { TenantMiddleware, TenantContextGuard };
