import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '@event-platform/shared';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        organizationId: any;
        role: any;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@event-platform/database").$Enums.UserStatus;
        deletedAt: Date | null;
        passwordHash: string | null;
        avatarUrl: string | null;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        mfaEnabled: boolean;
        mfaSecret: string | null;
        ssoProvider: string | null;
        ssoProviderId: string | null;
        lastLoginAt: Date | null;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map