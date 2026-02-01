import { UsersService } from './users.service';
import { User } from '@event-platform/database';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<{
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
    updateProfile(user: User, dto: any): Promise<{
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
//# sourceMappingURL=users.controller.d.ts.map