import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly prisma: PrismaService
  ) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // Extract tenant info from JWT payload (set by auth guard)
    const user = (req as any).user;

    if (user && user.organizationId) {
      try {
        // Fetch organization details
        const organization = await this.prisma.organization.findUnique({
          where: { id: user.organizationId },
        });

        if (!organization) {
          throw new UnauthorizedException('Organization not found');
        }

        if (organization.deletedAt) {
          throw new UnauthorizedException('Organization has been deleted');
        }

        // Get user's role in the organization
        const membership = await this.prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: user.organizationId,
              userId: user.sub,
            },
          },
        });

        if (!membership) {
          throw new UnauthorizedException('User is not a member of this organization');
        }

        // Set tenant context
        this.tenantService.setContext({
          organizationId: organization.id,
          organization,
          userId: user.sub,
          role: membership.role,
        });

        // Attach to request for easy access
        req.tenant = {
          organizationId: organization.id,
          userId: user.sub,
          role: membership.role,
        };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        // Log error but don't block - let guards handle authorization
      }
    }

    next();
  }
}
