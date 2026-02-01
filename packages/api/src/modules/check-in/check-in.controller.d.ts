import { CheckInService, CheckInDto } from './check-in.service';
export declare class CheckInController {
    private readonly checkInService;
    constructor(checkInService: CheckInService);
    checkIn(dto: CheckInDto): Promise<import("./check-in.service").CheckInResult>;
    getStats(eventId: string): Promise<{
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
    undoCheckIn(id: string): Promise<void>;
}
//# sourceMappingURL=check-in.controller.d.ts.map