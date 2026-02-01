import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { BadgeTemplate } from '@event-platform/database';
export declare class BadgesService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    createTemplate(eventId: string, dto: any): Promise<BadgeTemplate>;
    getTemplates(eventId: string): Promise<BadgeTemplate[]>;
    getTemplate(id: string): Promise<BadgeTemplate>;
    updateTemplate(id: string, dto: any): Promise<BadgeTemplate>;
    deleteTemplate(id: string): Promise<void>;
    private verifyEventAccess;
}
//# sourceMappingURL=badges.service.d.ts.map