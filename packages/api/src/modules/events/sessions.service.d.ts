import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { EventSession } from '@event-platform/database';
export interface CreateSessionDto {
    eventId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    track?: string;
    roomName?: string;
    capacity?: number;
}
export interface UpdateSessionDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    track?: string;
    roomName?: string;
    capacity?: number;
}
export declare class SessionsService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateSessionDto): Promise<EventSession>;
    findByEvent(eventId: string): Promise<EventSession[]>;
    findOne(id: string): Promise<EventSession>;
    update(id: string, dto: UpdateSessionDto): Promise<EventSession>;
    delete(id: string): Promise<void>;
    private verifyEventAccess;
}
//# sourceMappingURL=sessions.service.d.ts.map