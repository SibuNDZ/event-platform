import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { User, UserStatus, UserRole, Organization } from '@event-platform/database';
import { AuthTokens, JwtPayload } from '@event-platform/shared';
import { generateSlug } from '@event-platform/shared';

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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(dto: RegisterDto): Promise<{ user: User; organization?: Organization; tokens: AuthTokens }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
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
          status: UserStatus.ACTIVE,
        },
      });

      let organization: Organization | undefined;

      // If organization name provided, create it
      if (dto.organizationName) {
        const slug = generateSlug(dto.organizationName);

        // Check slug uniqueness
        const existingOrg = await tx.organization.findUnique({
          where: { slug },
        });

        const finalSlug = existingOrg
          ? `${slug}-${uuidv4().slice(0, 8)}`
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
            role: UserRole.OWNER,
          },
        });
      }

      return { user, organization };
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      result.user,
      result.organization?.id
    );

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

  async login(user: User, organizationId?: string): Promise<{ user: User; organization?: Organization; tokens: AuthTokens }> {
    let organization: Organization | undefined;

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
        throw new UnauthorizedException('Not a member of this organization');
      }

      organization = membership.organization;
    } else {
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

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
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

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokens(user: User, organizationId?: string): Promise<AuthTokens> {
    // Get user's role in organization
    let role: string | undefined;
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

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId,
      role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Create refresh token
    const refreshTokenValue = uuidv4();
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshExpiresMs = this.parseDuration(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenValue,
        expiresAt: new Date(Date.now() + refreshExpiresMs),
      },
    });

    const expiresIn = this.parseDuration(
      this.configService.get<string>('JWT_EXPIRES_IN', '15m')
    );

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: Math.floor(expiresIn / 1000),
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // default 15 minutes

    const value = parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens
    await this.logoutAll(userId);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => m.organization);
  }

  async switchOrganization(userId: string, organizationId: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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
      throw new UnauthorizedException('Not a member of this organization');
    }

    return this.generateTokens(user, organizationId);
  }
}
