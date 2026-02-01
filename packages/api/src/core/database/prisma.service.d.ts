import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@event-platform/database';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    cleanDatabase(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map