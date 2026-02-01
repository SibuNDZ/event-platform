import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { CheckIn } from '@event-platform/database';
export interface CheckInDto {
    qrCode: string;
    checkpointId?: string;
    deviceId?: string;
    latitude?: number;
    longitude?: number;
    isOffline?: boolean;
}
export interface CheckInResult {
    success: boolean;
    checkIn?: CheckIn;
    attendee?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        ticketType: string;
        photoUrl?: string;
    };
    message?: string;
    alreadyCheckedIn?: boolean;
    checkedInAt?: Date;
}
export declare class CheckInService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    checkIn(dto: CheckInDto): Promise<CheckInResult>;
    getCheckInStats(eventId: string): Promise<{
        totalAttendees: number;
        checkedIn: number;
        notCheckedIn: number;
        checkInRate: number;
        byCheckpoint: (import("@event-platform/database").Prisma.PickEnumerable<import("@event-platform/database").Prisma.CheckInGroupByOutputType, "checkpointId"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    undoCheckIn(checkInId: string): Promise<void>;
}
//# sourceMappingURL=check-in.service.d.ts.map