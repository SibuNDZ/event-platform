import { AuthService, RegisterDto } from './auth.service';
import { User } from '@event-platform/database';
import { LoginDto, RefreshTokenDto, SwitchOrganizationDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        organization: {
            id: string;
            name: string;
            slug: string;
        } | null;
        tokens: AuthTokens;
    }>;
    login(req: any, dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        organization: {
            id: string;
            name: string;
            slug: string;
            licenseTier: import("@event-platform/database").$Enums.LicenseTier;
        } | null;
        tokens: AuthTokens;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        tokens: AuthTokens;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    logoutAll(user: User): Promise<{
        message: string;
    }>;
    getProfile(user: User): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        phone: string | null;
        emailVerified: boolean;
        mfaEnabled: boolean;
        createdAt: Date;
    }>;
    getOrganizations(user: User): Promise<{
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        licenseTier: import("@event-platform/database").$Enums.LicenseTier;
    }[]>;
    switchOrganization(user: User, dto: SwitchOrganizationDto): Promise<{
        tokens: AuthTokens;
    }>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map