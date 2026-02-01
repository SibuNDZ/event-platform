import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
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
//# sourceMappingURL=local.strategy.d.ts.map