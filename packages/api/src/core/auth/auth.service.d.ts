import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { User, Organization } from '@event-platform/database';
import { AuthTokens } from '@event-platform/shared';
export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
}
export interface LoginDto {
    email: string;
    password: string;
    organizationId?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<User | null>;
    register(dto: RegisterDto): Promise<{
        user: User;
        organization?: Organization;
        tokens: AuthTokens;
    }>;
    login(user: User, organizationId?: string): Promise<{
        user: User;
        organization?: Organization;
        tokens: AuthTokens;
    }>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    private generateTokens;
    private parseDuration;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    getUserOrganizations(userId: string): Promise<Organization[]>;
    switchOrganization(userId: string, organizationId: string): Promise<AuthTokens>;
}
//# sourceMappingURL=auth.service.d.ts.map