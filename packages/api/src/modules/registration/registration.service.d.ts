import { PrismaService } from '../../core/database/prisma.service';
export declare class RegistrationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(eventId: string, data: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=registration.service.d.ts.map