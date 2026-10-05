import type { NextFunction, Request, Response } from 'express';

interface Window {
  startedAt: number;
  count: number;
}

/**
 * Fixed-window, per-IP request limit kept in process memory. Enough for a single API
 * instance; behind several instances or a proxy, move this to the gateway.
 * `req.ip` ignores X-Forwarded-For unless Express `trust proxy` is set, so callers
 * cannot dodge the limit by sending their own header.
 */
export function createRateLimit(options: {
  limit: number;
  windowMs: number;
  message: string;
}) {
  const windows = new Map<string, Window>();

  return (request: Request, response: Response, next: NextFunction) => {
    if (options.limit <= 0 || request.method === 'OPTIONS') return next();

    const key = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    let window = windows.get(key);
    if (!window || now - window.startedAt >= options.windowMs) {
      window = { startedAt: now, count: 0 };
      windows.set(key, window);
      // Drop stale entries now and then so the map cannot grow without bound
      if (windows.size > 10_000) {
        for (const [ip, entry] of windows) {
          if (now - entry.startedAt >= options.windowMs) windows.delete(ip);
        }
      }
    }

    window.count += 1;
    const remaining = Math.max(0, options.limit - window.count);
    response.setHeader('RateLimit-Limit', String(options.limit));
    response.setHeader('RateLimit-Remaining', String(remaining));

    if (window.count > options.limit) {
      const retryAfter = Math.ceil(
        (window.startedAt + options.windowMs - now) / 1000,
      );
      response.setHeader('Retry-After', String(retryAfter));
      return response.status(429).json({ message: options.message });
    }
    return next();
  };
}
