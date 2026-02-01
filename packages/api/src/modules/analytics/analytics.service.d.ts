import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
interface DashboardResponse {
    event: {
        id: string | undefined;
        name: string | undefined;
        startDate: Date | undefined;
        endDate: Date | undefined;
        status: string | undefined;
    };
    stats: {
        totalAttendees: number;
        totalOrders: number;
        totalRevenue: number;
        checkIns: number;
        checkInRate: number;
    };
    charts: {
        registrationsByDay: Array<{
            date: Date;
            count: number;
        }>;
        ticketTypeDistribution: Array<{
            ticketType: string;
            count: number;
        }>;
    };
}
export declare class AnalyticsService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    getDashboard(eventId: string): Promise<DashboardResponse>;
    private getRegistrationsByDay;
    private getTicketTypeDistribution;
    exportAttendees(eventId: string, format?: 'csv' | 'xlsx'): Promise<{
        filename: string;
        content: string;
        contentType: string;
    }>;
    private verifyEventAccess;
}
export {};
//# sourceMappingURL=analytics.service.d.ts.map