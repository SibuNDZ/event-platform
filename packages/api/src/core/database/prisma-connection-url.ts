const DEFAULT_CONNECTION_LIMIT = 10;
const DEFAULT_POOL_TIMEOUT_SECONDS = 10;

/**
 * Railway containers report the host CPU count, so Prisma's default pool
 * (`num_cpus * 2 + 1`) can open 90+ connections. That exhausts Railway
 * Postgres and can OOM the API replica after the first health check.
 */
export function applyPrismaConnectionLimit(
  databaseUrl: string | undefined,
  limit = resolvePrismaConnectionLimit()
): string | undefined {
  if (!databaseUrl) {
    return databaseUrl;
  }

  const connectionLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_CONNECTION_LIMIT;
  const params: string[] = [];

  if (!/[?&]connection_limit=/.test(databaseUrl)) {
    params.push(`connection_limit=${connectionLimit}`);
  }
  if (!/[?&]pool_timeout=/.test(databaseUrl)) {
    params.push(`pool_timeout=${DEFAULT_POOL_TIMEOUT_SECONDS}`);
  }

  if (params.length === 0) {
    return databaseUrl;
  }

  const join = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${join}${params.join('&')}`;
}

export function resolvePrismaConnectionLimit(raw = process.env.PRISMA_CONNECTION_LIMIT): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONNECTION_LIMIT;
}
