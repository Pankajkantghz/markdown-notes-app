import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { pool } from "../prisma/pool.js";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  name: string;
}

const cleanup = setInterval(() => {
  void Promise.all([
    pool.query('DELETE FROM "RateLimitCounter" WHERE "expiresAt" <= NOW()'),
    pool.query('DELETE FROM "Session" WHERE "expiresAt" <= NOW()'),
  ]).catch((error: unknown) =>
    console.error(
      JSON.stringify({
        type: "expired_data_cleanup_error",
        name: error instanceof Error ? error.name : "UnknownError",
      }),
    ),
  );
}, 5 * 60_000);
cleanup.unref();

export function createRateLimit({
  windowMs,
  max,
  name,
}: RateLimitOptions): RequestHandler {
  return async (req, res, next) => {
    try {
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const ipHash = createHash("sha256")
        .update(req.ip || "unknown")
        .digest("hex");
      const key = createHash("sha256")
        .update(`${name}:${ipHash}:${window}`)
        .digest("hex");
      const expiresAt = new Date((window + 1) * windowMs);
      const { rows } = await pool.query<{ count: number }>(
        'INSERT INTO "RateLimitCounter" ("key", "count", "expiresAt") VALUES ($1, 1, $2) ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimitCounter"."count" + 1 RETURNING "count"',
        [key, expiresAt],
      );
      const count = rows[0]?.count ?? 0;
      const remaining = Math.max(0, max - count);
      res.set({
        "RateLimit-Limit": String(max),
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(Math.ceil(expiresAt.getTime() / 1000)),
      });
      if (count > max) {
        res.set(
          "Retry-After",
          String(Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000))),
        );
        res
          .status(429)
          .json({
            success: false,
            error: "Too many requests. Please try again shortly.",
          });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
