import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Speaker } from '@event-platform/database';
export declare class SpeakersService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(eventId: string, dto: any): Promise<Speaker>;
    findByEvent(eventId: string): Promise<Speaker[]>;
    findOne(id: string): Promise<Speaker>;
    update(id: string, dto: any): Promise<Speaker>;
    delete(id: string): Promise<void>;
    private verifyEventAccess;
}
//# sourceMappingURL=speakers.service.d.ts.map