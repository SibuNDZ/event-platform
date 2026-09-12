import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from './tenant.service';

type AuthUser = {
  id?: string;
  sub?: string;
  organizationId?: string;
};

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      tenant?: TenantContext;
    }>();
    const user = request.user;

    if (!user) {
      return true;
    }

    const userId = user.id || user.sub;
    const organizationId = user.organizationId;

    if (!userId || !organizationId) {
      return true;
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.deletedAt) {
      throw new UnauthorizedException('Organization not found');
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
      throw new UnauthorizedException('User is not a member of this organization');
    }

    request.tenant = {
      organizationId: organization.id,
      organization,
      userId,
      role: membership.role,
    };

    return true;
  }
}
