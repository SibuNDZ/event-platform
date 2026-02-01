import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../database/prisma.service';
export interface RequestWithTenant extends Request {
    tenant?: {
        organizationId: string;
        userId: string;
        role: string;
    };
}
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantService;
    private readonly prisma;
    constructor(tenantService: TenantService, prisma: PrismaService);
    use(req: RequestWithTenant, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tenant.middleware.d.ts.map