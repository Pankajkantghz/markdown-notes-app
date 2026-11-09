import type { RequestHandler } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function createRateLimit({
  windowMs,
  max,
}: RateLimitOptions): RequestHandler {
  const clients = new Map<string, { count: number; resetAt: number }>();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    let client = clients.get(ip);

    if (!client || client.resetAt <= now) {
      client = { count: 0, resetAt: now + windowMs };
      clients.set(ip, client);
    }

    if (client.count >= max) {
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again shortly.",
      });
      return;
    }

    client.count += 1;
    next();
  };
}
