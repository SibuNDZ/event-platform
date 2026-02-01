import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { TicketType } from '@event-platform/database';
export declare class TicketTypesService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(eventId: string, dto: any): Promise<TicketType>;
    findByEvent(eventId: string): Promise<TicketType[]>;
    findOne(id: string): Promise<TicketType>;
    update(id: string, dto: any): Promise<TicketType>;
    delete(id: string): Promise<void>;
    private verifyEventAccess;
}
//# sourceMappingURL=ticket-types.service.d.ts.map