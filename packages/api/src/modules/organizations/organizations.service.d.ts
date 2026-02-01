import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Organization } from '@event-platform/database';
export declare class OrganizationsService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    getCurrent(): Promise<Organization>;
    update(data: Partial<Organization>): Promise<Organization>;
    getMembers(): Promise<object[]>;
}
//# sourceMappingURL=organizations.service.d.ts.map