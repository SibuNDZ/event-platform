"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../database/prisma.service");
const database_1 = require("@event-platform/database");
const utils_1 = require("@event-platform/shared/utils");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) {
            return null;
        }
        if (user.status !== database_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        // Create user and optionally organization in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    status: database_1.UserStatus.ACTIVE,
                },
            });
            let organization;
            // If organization name provided, create it
            if (dto.organizationName) {
                const slug = (0, utils_1.generateSlug)(dto.organizationName);
                // Check slug uniqueness
                const existingOrg = await tx.organization.findUnique({
                    where: { slug },
                });
                const finalSlug = existingOrg
                    ? `${slug}-${(0, uuid_1.v4)().slice(0, 8)}`
                    : slug;
                organization = await tx.organization.create({
                    data: {
                        name: dto.organizationName,
                        slug: finalSlug,
                    },
                });
                // Add user as owner
                await tx.organizationMember.create({
                    data: {
                        organizationId: organization.id,
                        userId: user.id,
                        role: database_1.UserRole.OWNER,
                    },
                });
            }
            return { user, organization };
        });
        // Generate tokens
        const tokens = await this.generateTokens(result.user, result.organization?.id);
        // Update last login
        await this.prisma.user.update({
            where: { id: result.user.id },
            data: { lastLoginAt: new Date() },
        });
        return {
            user: result.user,
            organization: result.organization,
            tokens,
        };
    }
    async login(user, organizationId) {
        let organization;
        if (organizationId) {
            // Verify user is member of organization
            const membership = await this.prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId: user.id,
                    },
                },
                include: {
                    organization: true,
                },
            });
            if (!membership) {
                throw new common_1.UnauthorizedException('Not a member of this organization');
            }
            organization = membership.organization;
        }
        else {
            // Get user's first organization
            const membership = await this.prisma.organizationMember.findFirst({
                where: { userId: user.id },
                include: { organization: true },
                orderBy: { createdAt: 'asc' },
            });
            organization = membership?.organization;
        }
        const tokens = await this.generateTokens(user, organization?.id);
        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return { user, organization, tokens };
    }
    async refreshTokens(refreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.revokedAt) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        // Revoke old token
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        // Get user's current organization membership
        const membership = await this.prisma.organizationMember.findFirst({
            where: { userId: storedToken.userId },
            orderBy: { createdAt: 'asc' },
        });
        return this.generateTokens(storedToken.user, membership?.organizationId);
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });
    }
    async generateTokens(user, organizationId) {
        // Get user's role in organization
        let role;
        if (organizationId) {
            const membership = await this.prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId: user.id,
                    },
                },
            });
            role = membership?.role;
        }
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId,
            role,
        };
        const accessToken = this.jwtService.sign(payload);
        // Create refresh token
        const refreshTokenValue = (0, uuid_1.v4)();
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const refreshExpiresMs = this.parseDuration(refreshExpiresIn);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshTokenValue,
                expiresAt: new Date(Date.now() + refreshExpiresMs),
            },
        });
        const expiresIn = this.parseDuration(this.configService.get('JWT_EXPIRES_IN', '15m'));
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: Math.floor(expiresIn / 1000),
        };
    }
    parseDuration(duration) {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match)
            return 15 * 60 * 1000; // default 15 minutes
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 15 * 60 * 1000;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.BadRequestException('User not found');
        }
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        // Revoke all refresh tokens
        await this.logoutAll(userId);
    }
    async getUserOrganizations(userId) {
        const memberships = await this.prisma.organizationMember.findMany({
            where: { userId },
            include: { organization: true },
            orderBy: { createdAt: 'asc' },
        });
        return memberships.map((m) => m.organization);
    }
    async switchOrganization(userId, organizationId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const membership = await this.prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId,
                },
            },
        });
        if (!membership) {
            throw new common_1.UnauthorizedException('Not a member of this organization');
        }
        return this.generateTokens(user, organizationId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map