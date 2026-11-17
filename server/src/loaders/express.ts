import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import { serve, setup } from "swagger-ui-express";
import config from "../config/index.js";
import api from "../api/index.js";
import { createRateLimit } from "../utils/rateLimit.js";
import { openApiDocument } from "../docs/openapi.js";

export default ({ app }: { app: Express }) => {
  // Security & Cache Headers
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
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

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.clientOrigins.includes(origin))
          callback(null, true);
        else callback(new Error("Origin not allowed"));
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type"],
      maxAge: 600,
    }),
  );

  // Rate Limiters & Body Parsing
  app.use("/auth", createRateLimit({ windowMs: 60_000, max: 20 }));
  app.use("/notes", createRateLimit({ windowMs: 60_000, max: 120 }));
  app.use("/notes/grammar", createRateLimit({ windowMs: 60_000, max: 20 }));
  app.use(express.json({ limit: "1mb", strict: true }));

  // Health Check & OpenAPI Docs
  app.get("/", (_req, res) => {
    res.status(200).send("API is running.");
  });
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", ...serve, setup(openApiDocument));

  // Load API Routes
  app.use(api);

  // 404 Catch-All Handler
  app.use((_req, _res, next) => {
    const err: any = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  // Centralized Error Handler
  const handleError: ErrorRequestHandler = (error: any, _req, res, _next) => {
    let code = Number(error?.status) || 500;

    if (error instanceof Error && error.message === "Origin not allowed") {
      code = 403;
    }

    if (![400, 403, 404, 413].includes(code)) {
      code = 500;
    }

    if (code === 500) {
      console.error("Unhandled API error:", error);
    }

    const messages: Record<number, string> = {
      400: "Invalid request body",
      403: "Origin not allowed",
      404: "Resource not found",
      413: "Request body is too large",
      500: "Internal server error",
    };

    res.status(code).json({
      success: false,
      error: messages[code],
    });
  };

  app.use(handleError);
};
