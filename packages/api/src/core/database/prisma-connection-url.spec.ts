import { describe, expect, it } from 'vitest';
import { applyPrismaConnectionLimit, resolvePrismaConnectionLimit } from './prisma-connection-url';

describe('applyPrismaConnectionLimit', () => {
  it('adds connection_limit and pool_timeout to a bare URL', () => {
    expect(applyPrismaConnectionLimit('postgresql://user:pass@host:5432/db', 5)).toBe(
      'postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10'
    );
  });

  it('appends to an existing query string without rewriting the password', () => {
    expect(
      applyPrismaConnectionLimit('postgresql://user:p%40ss@host:5432/db?schema=public', 8)
    ).toBe(
      'postgresql://user:p%40ss@host:5432/db?schema=public&connection_limit=8&pool_timeout=10'
    );
  });

  it('leaves an explicit connection_limit in place', () => {
    expect(
      applyPrismaConnectionLimit(
        'postgresql://user:pass@host:5432/db?connection_limit=3&schema=public',
        10
      )
    ).toBe('postgresql://user:pass@host:5432/db?connection_limit=3&schema=public&pool_timeout=10');
  });

  it('returns undefined when no URL is configured', () => {
    expect(applyPrismaConnectionLimit(undefined)).toBeUndefined();
  });
});

describe('resolvePrismaConnectionLimit', () => {
  it('falls back to 10 for missing or invalid values', () => {
    expect(resolvePrismaConnectionLimit(undefined)).toBe(10);
    expect(resolvePrismaConnectionLimit('')).toBe(10);
    expect(resolvePrismaConnectionLimit('nope')).toBe(10);
    expect(resolvePrismaConnectionLimit('0')).toBe(10);
  });

  it('parses a positive integer override', () => {
    expect(resolvePrismaConnectionLimit('6')).toBe(6);
  });
});
