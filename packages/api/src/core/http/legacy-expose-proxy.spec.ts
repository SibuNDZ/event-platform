import http from 'http';
import type { AddressInfo } from 'net';
import { afterEach, describe, expect, it } from 'vitest';
import {
  LEGACY_DOCKER_EXPOSE_PORT,
  bindLegacyExposeProxy,
  shouldBindLegacyExposePort,
} from './legacy-expose-proxy';

function listen(server: http.Server, port = 0): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve((server.address() as AddressInfo).port);
    });
  });
}

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

describe('bindLegacyExposeProxy', () => {
  const servers: http.Server[] = [];

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve) => {
            server.close(() => resolve());
          })
      )
    );
  });

  it('forwards HTTP requests from the historic EXPOSE port to PORT', async () => {
    const upstream = http.createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });
    const listenPort = await listen(upstream);
    servers.push(upstream);

    const placeholder = http.createServer();
    const legacyPort = await listen(placeholder);
    await new Promise<void>((resolve) => placeholder.close(() => resolve()));

    const proxy = bindLegacyExposeProxy(listenPort, legacyPort);
    expect(proxy).toBeDefined();
    servers.push(proxy as http.Server);
    await new Promise<void>((resolve, reject) => {
      proxy?.once('listening', () => resolve());
      proxy?.once('error', reject);
      if (proxy?.listening) resolve();
    });

    const response = await fetch(`http://127.0.0.1:${legacyPort}/api/health`);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
    expect(response.status).toBe(200);
  });
});
