import 'reflect-metadata';
import { Controller, ForbiddenException, Get, INestApplication, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { Roles, ROLES_KEY } from './tenant.decorator';
import { RolesGuard } from './tenant.guard';

class SampleController {
  @Roles('ADMIN')
  adminOnly() {
    return true;
  }

  openToAnyRole() {
    return true;
  }
}

function mockContext(
  role?: string,
  handler?: (...args: unknown[]) => unknown,
  klass?: object,
) {
  return {
    getHandler: () => handler ?? (() => ({})),
    getClass: () => klass ?? {},
    switchToHttp: () => ({
      getRequest: () => ({ tenant: role ? { role } : undefined }),
    }),
  } as never;
}

describe('Roles decorator', () => {
  it('stores required roles under the roles metadata key', () => {
    const reflector = new Reflector();
    expect(reflector.get(ROLES_KEY, SampleController.prototype.adminOnly)).toEqual(['ADMIN']);
    expect(reflector.get(ROLES_KEY, SampleController.prototype.openToAnyRole)).toBeUndefined();
  });
});

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  const createContext = (tenant?: { role?: string }, user?: { role?: string }) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ tenant, user }),
      }),
    }) as never;

  const guard = new RolesGuard(reflector as never);

  it('allows routes that do not require a role', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows a matching tenant role', () => {
    reflector.getAllAndOverride.mockReturnValue(['STAFF']);

    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('rejects a missing tenant role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });

  it('falls back to the JWT user role when tenant context is missing', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(guard.canActivate(createContext(undefined, { role: 'OWNER' }))).toBe(true);
  });

  it('rejects a role below the required level', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(createContext({ role: 'VIEWER' }))).toThrow(ForbiddenException);
  });

  it('reads @Roles() metadata through a real Reflector', () => {
    const realReflector = new Reflector();
    const realGuard = new RolesGuard(realReflector);
    const handler = SampleController.prototype.adminOnly;

    expect(realGuard.canActivate(mockContext('ADMIN', handler, SampleController))).toBe(true);
    expect(() => realGuard.canActivate(mockContext('STAFF', handler, SampleController))).toThrow(
      ForbiddenException,
    );
    expect(
      realGuard.canActivate(mockContext('VIEWER', SampleController.prototype.openToAnyRole, SampleController)),
    ).toBe(true);
  });
});

@Controller()
class GuardProbeController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('admin')
  @Roles('ADMIN')
  admin() {
    return { ok: true };
  }
}

@Module({
  controllers: [GuardProbeController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
class GuardProbeModule {}

describe('RolesGuard HTTP', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GuardProbeModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use((req: Request & { tenant?: { role: string } }, _res: Response, next: NextFunction) => {
      const role = req.header('x-tenant-role');
      if (role) {
        req.tenant = { role };
      }
      next();
    });
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves public health without crashing when registered as APP_GUARD', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('enforces @Roles() on protected routes', async () => {
    const denied = await fetch(`${baseUrl}/api/admin`);
    expect(denied.status).toBe(403);

    const forbidden = await fetch(`${baseUrl}/api/admin`, {
      headers: { 'x-tenant-role': 'VIEWER' },
    });
    expect(forbidden.status).toBe(403);

    const allowed = await fetch(`${baseUrl}/api/admin`, {
      headers: { 'x-tenant-role': 'ADMIN' },
    });
    expect(allowed.status).toBe(200);
    await expect(allowed.json()).resolves.toEqual({ ok: true });
  });
});
