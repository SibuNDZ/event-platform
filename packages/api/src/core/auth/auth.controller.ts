import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, RegisterDto } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '@event-platform/database';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  LoginDto,
  RefreshTokenDto,
  SwitchOrganizationDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from './auth.constants';
import type { AuthTokens } from '@event-platform/shared';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, organization, tokens } = await this.authService.register(dto);
    this.setAuthCookies(res, tokens);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          }
        : null,
      expiresIn: tokens.expiresIn,
    };
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Req() req: any,
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, organization, tokens } = await this.authService.login(
      req.user,
      dto.organizationId
    );
    this.setAuthCookies(res, tokens);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            licenseTier: organization.licenseTier,
          }
        : null,
      expiresIn: tokens.expiresIn,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req: Request,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshToken(req, dto);
    if (!refreshToken) {
      return { message: 'No refresh token provided' };
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Req() req: Request,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshToken(req, dto);
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    this.clearAuthCookies(res);
    return { message: 'Logged out from all devices' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    };
  }

  @Get('organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user organizations' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved' })
  async getOrganizations(@CurrentUser() user: User) {
    const organizations = await this.authService.getUserOrganizations(user.id);
    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      licenseTier: org.licenseTier,
    }));
  }

  @Post('switch-organization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch to a different organization' })
  @ApiResponse({ status: 200, description: 'Organization switched' })
  async switchOrganization(
    @CurrentUser() user: User,
    @Body() dto: SwitchOrganizationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.switchOrganization(
      user.id,
      dto.organizationId
    );
    this.setAuthCookies(res, tokens);
    return { expiresIn: tokens.expiresIn };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto
  ) {
    await this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword
    );
    return { message: 'Password changed successfully' };
  }

  private setAuthCookies(res: Response, tokens: AuthTokens) {
    const cookieOptions = this.getCookieOptions();
    res.cookie(AUTH_COOKIE_ACCESS, tokens.accessToken, {
      ...cookieOptions,
      maxAge: this.parseDuration(
        this.configService.get<string>('JWT_EXPIRES_IN', '15m')
      ),
    });
    res.cookie(AUTH_COOKIE_REFRESH, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: this.parseDuration(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      ),
    });
  }

  private clearAuthCookies(res: Response) {
    const cookieOptions = this.getCookieOptions();
    res.clearCookie(AUTH_COOKIE_ACCESS, cookieOptions);
    res.clearCookie(AUTH_COOKIE_REFRESH, cookieOptions);
  }

  private getRefreshToken(req: Request, dto?: RefreshTokenDto): string | undefined {
    return dto?.refreshToken || req.cookies?.[AUTH_COOKIE_REFRESH];
  }

  private getCookieOptions() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/api',
      ...(domain ? { domain } : {}),
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000;
    const value = parseInt(match[1]!, 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000;
    }
  }
}
