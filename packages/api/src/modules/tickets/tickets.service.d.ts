import { PrismaService } from '../../core/database/prisma.service';
import { Ticket } from '@event-platform/database';
export declare class TicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByQrCode(qrCode: string): Promise<Ticket>;
    findOne(id: string): Promise<Ticket>;
}
//# sourceMappingURL=tickets.service.d.ts.map