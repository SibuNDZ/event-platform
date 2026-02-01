import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { Attendee, Prisma } from '@event-platform/database';
export declare class AttendeesService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    findByEvent(eventId: string, query?: any): Promise<{
        items: ({
            tickets: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                ticketTypeId: string;
                orderItemId: string;
                attendeeId: string;
                ticketNumber: string;
                qrCode: string;
                qrCodeUrl: string | null;
                status: import("@event-platform/database").$Enums.TicketStatus;
                pdfUrl: string | null;
                isTransferred: boolean;
                originalAttendeeId: string | null;
                transferredAt: Date | null;
                sentByEmail: boolean;
                sentByWhatsApp: boolean;
                lastSentAt: Date | null;
            }[];
            checkIns: {
                id: string;
                checkedInAt: Date;
                attendeeId: string;
                ticketId: string;
                checkpointId: string | null;
                checkedInBy: string | null;
                deviceId: string | null;
                latitude: number | null;
                longitude: number | null;
                isOfflineCheckIn: boolean;
                syncedAt: Date | null;
                notes: string | null;
            }[];
        } & {
            id: string;
            eventId: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            company: string | null;
            jobTitle: string | null;
            bio: string | null;
            photoUrl: string | null;
            linkedinUrl: string | null;
            twitterUrl: string | null;
            attendeeType: import("@event-platform/database").$Enums.AttendeeType;
            customFields: Prisma.JsonValue | null;
            isNetworkingEnabled: boolean;
            networkingProfile: Prisma.JsonValue | null;
            isApproved: boolean;
            approvedAt: Date | null;
            approvedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            page: any;
            perPage: any;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Attendee>;
    update(id: string, dto: any): Promise<Attendee>;
    private verifyEventAccess;
}
//# sourceMappingURL=attendees.service.d.ts.map