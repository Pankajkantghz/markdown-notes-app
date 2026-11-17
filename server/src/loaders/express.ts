import { randomUUID } from "node:crypto";
import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import { serve, setup } from "swagger-ui-express";
import config from "../config/index.js";
import api from "../api/index.js";
import { createRateLimit } from "../utils/rateLimit.js";
import { openApiDocument } from "../docs/openapi.js";
import { pool } from "../prisma/pool.js";

export default ({ app }: { app: Express }) => {
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use((_req, res, next) => {
    const started = Date.now();
    const requestId = randomUUID();
    res.set({
      "X-Request-Id": requestId,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      ...(config.production
        ? { "Strict-Transport-Security": "max-age=31536000" }
        : {}),
    });
    res.on("finish", () =>
      console.info(
        JSON.stringify({
          type: "http",
          requestId,
          method: _req.method,
          path: _req.path,
          status: res.statusCode,
          durationMs: Date.now() - started,
        }),
      ),
    );
    next();
  });
  app.use("/notes", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/auth", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(
          null,
          Boolean(origin && config.clientOrigins.includes(origin)),
        );
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "X-Mireth-Request"],
      maxAge: 600,
    }),
  );

  app.use(
    "/auth",
    createRateLimit({ name: "auth", windowMs: 60_000, max: 20 }),
  );
  app.use(
    "/notes/grammar",
    createRateLimit({ name: "grammar", windowMs: 60_000, max: 20 }),
  );
  app.use(
    "/notes",
    createRateLimit({ name: "notes", windowMs: 60_000, max: 120 }),
  );
  app.use(express.json({ limit: "1mb", strict: true }));

  app.get("/", (_req, res) => res.status(200).send("API is running."));
  app.get("/health/live", (_req, res) =>
    res.status(200).json({ status: "ok" }),
  );
  app.get("/health/ready", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      await pool.query('SELECT 1 FROM "Session" LIMIT 0');
      await pool.query('SELECT 1 FROM "RateLimitCounter" LIMIT 0');
      res.status(200).json({ status: "ready" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use(
    "/docs",
    ...serve,
    setup(openApiDocument, {
      swaggerOptions: {
        requestInterceptor: (request: { headers: Record<string, string> }) => {
          request.headers["X-Mireth-Request"] = "1";
          return request;
        },
      },
    }),
  );
  app.use(api);
  app.use((_req, _res, next) => {
    const error = new Error("Not Found") as Error & { status: number };
    error.status = 404;
    next(error);
  });

  const handleError: ErrorRequestHandler = (
    error: unknown,
    req,
    res,
    _next,
  ) => {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : 500;
    const code = [400, 403, 404, 413].includes(status) ? status : 500;
    if (code === 500)
      console.error(
        JSON.stringify({
          type: "api_error",
          requestId: res.getHeader("X-Request-Id"),
          path: req.path,
          name: error instanceof Error ? error.name : "UnknownError",
        }),
      );
    const messages: Record<number, string> = {
      400: "Invalid request body",
      403: "Origin not allowed",
      404: "Resource not found",
      413: "Request body is too large",
      500: "Internal server error",
    };
    res.status(code).json({ success: false, error: messages[code] });
  };
  app.use(handleError);
};
