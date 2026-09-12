import http from 'http';

/** Historic Dockerfile EXPOSE. Railway may still route public traffic here. */
export const LEGACY_DOCKER_EXPOSE_PORT = 3001;

export function shouldBindLegacyExposePort(
  listenPort: number,
  legacyPort = LEGACY_DOCKER_EXPOSE_PORT
): boolean {
  return Number.isFinite(listenPort) && listenPort > 0 && listenPort !== legacyPort;
}

export function bindLegacyExposeProxy(
  listenPort: number,
  legacyPort = LEGACY_DOCKER_EXPOSE_PORT
): http.Server | undefined {
  if (!shouldBindLegacyExposePort(listenPort, legacyPort)) {
    return undefined;
  }

  const server = http.createServer((req, res) => {
    const proxy = http.request(
      {
        host: '127.0.0.1',
        port: listenPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (upstream) => {
        res.writeHead(upstream.statusCode ?? 502, upstream.headers);
        upstream.pipe(res);
      }
    );
    proxy.on('error', () => {
      res.statusCode = 502;
      res.end();
    });
    req.pipe(proxy);
  });

  server.on('error', (error) => {
    console.warn(`Legacy EXPOSE proxy failed to bind ${legacyPort}:`, error);
  });

  server.listen(legacyPort, '0.0.0.0', () => {
    console.log(`Legacy EXPOSE proxy listening on http://0.0.0.0:${legacyPort} -> ${listenPort}`);
  });

  return server;
}
