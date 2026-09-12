import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TenantContextGuard } from './tenant-context.guard';

describe('TenantContextGuard', () => {
  const tenantService = {
    setContext: vi.fn(),
  };
  const prisma = {
    organization: {
      findUnique: vi.fn(),
    },
    organizationMember: {
      findUnique: vi.fn(),
    },
  };

  const createContext = (user?: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  const guard = new TenantContextGuard(tenantService as never, prisma as never);

  it('allows public requests without a user', async () => {
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(tenantService.setContext).not.toHaveBeenCalled();
  });

  it('hydrates tenant context from user.id', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      deletedAt: null,
    });
    prisma.organizationMember.findUnique.mockResolvedValue({ role: 'OWNER' });

    const request = { user: { id: 'user_1', organizationId: 'org_1' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId_userId: {
          organizationId: 'org_1',
          userId: 'user_1',
        },
      },
    });
    expect(tenantService.setContext).toHaveBeenCalledWith({
      organizationId: 'org_1',
      organization: { id: 'org_1', deletedAt: null },
      userId: 'user_1',
      role: 'OWNER',
    });
    expect(request).toHaveProperty('tenant.userId', 'user_1');
  });

  it('falls back to user.sub when id is missing', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      deletedAt: null,
    });
    prisma.organizationMember.findUnique.mockResolvedValue({ role: 'ADMIN' });

    await expect(
      guard.canActivate(createContext({ sub: 'user_2', organizationId: 'org_1' }))
    ).resolves.toBe(true);
    expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId_userId: {
          organizationId: 'org_1',
          userId: 'user_2',
        },
      },
    });
  });

  it('rejects users who are not organization members', async () => {
    prisma.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      deletedAt: null,
    });
    prisma.organizationMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ id: 'user_1', organizationId: 'org_1' }))
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
