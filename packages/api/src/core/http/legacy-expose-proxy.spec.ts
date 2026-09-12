import { describe, expect, it } from 'vitest';
import { LEGACY_DOCKER_EXPOSE_PORT, shouldBindLegacyExposePort } from './legacy-expose-proxy';

describe('shouldBindLegacyExposePort', () => {
  it('binds the historic EXPOSE port when Railway PORT differs', () => {
    expect(shouldBindLegacyExposePort(8080)).toBe(true);
    expect(shouldBindLegacyExposePort(8080, LEGACY_DOCKER_EXPOSE_PORT)).toBe(true);
  });

  it('does not bind a second listener when already on the legacy port', () => {
    expect(shouldBindLegacyExposePort(3001)).toBe(false);
  });

  it('ignores invalid listen ports', () => {
    expect(shouldBindLegacyExposePort(Number.NaN)).toBe(false);
    expect(shouldBindLegacyExposePort(0)).toBe(false);
  });
});
