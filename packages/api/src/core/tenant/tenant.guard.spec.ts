import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './tenant.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  const createContext = (tenant?: { role?: string }) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ tenant }),
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

  it('rejects a role below the required level', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(createContext({ role: 'VIEWER' }))).toThrow(ForbiddenException);
  });
});
