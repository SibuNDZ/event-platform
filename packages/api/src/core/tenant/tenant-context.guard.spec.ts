import 'reflect-metadata';
import { Controller, Get, INestApplication, Req, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { TenantContextGuard } from './tenant-context.guard';

describe('TenantContextGuard', () => {
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

  const guard = new TenantContextGuard(prisma as never);

  it('allows public requests without a user', async () => {
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
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
    expect(request).toHaveProperty('tenant', {
      organizationId: 'org_1',
      organization: { id: 'org_1', deletedAt: null },
      userId: 'user_1',
      role: 'OWNER',
    });
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

@Controller()
class TenantProbeController {
  @Get('me')
  me(@Req() request: { tenant?: { organizationId?: string } }) {
    return { organizationId: request.tenant?.organizationId ?? null };
  }
}

describe('TenantContextGuard HTTP DI', () => {
  let app: INestApplication;
  let baseUrl: string;
  const prisma = {
    organization: {
      findUnique: vi.fn().mockResolvedValue({ id: 'org_1', deletedAt: null }),
    },
    organizationMember: {
      findUnique: vi.fn().mockResolvedValue({ role: 'OWNER' }),
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TenantProbeController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: TenantContextGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(
      (
        req: Request & { user?: { id: string; organizationId: string } },
        _res: Response,
        next: NextFunction
      ) => {
        req.user = { id: 'user_1', organizationId: 'org_1' };
        next();
      }
    );
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('injects PrismaService when registered as a global APP_GUARD', async () => {
    const response = await fetch(`${baseUrl}/api/me`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ organizationId: 'org_1' });
    expect(prisma.organization.findUnique).toHaveBeenCalled();
  });
});
