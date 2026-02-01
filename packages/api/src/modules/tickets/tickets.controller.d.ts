import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findOne(id: string): Promise<{
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
    }>;
    findByQrCode(qrCode: string): Promise<{
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
    }>;
}
//# sourceMappingURL=tickets.controller.d.ts.map