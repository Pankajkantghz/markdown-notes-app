import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import noteRoutes from "./routes/note.routes.js";
import { CLIENT_ORIGINS } from "./utils/config.js";
import { createRateLimit } from "./utils/rateLimit.js";

const app: Express = express();

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.set({
    "Content-Security-Policy":
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CLIENT_ORIGINS.includes(origin)) callback(null, true);
      else callback(new Error("Origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  }),
);
app.use("/notes", createRateLimit({ windowMs: 60_000, max: 120 }));
app.use("/notes/grammar", createRateLimit({ windowMs: 60_000, max: 20 }));
app.use(express.json({ limit: "1mb", strict: true }));

app.use("/notes", noteRoutes);

app.get("/", (_req, res) => {
  res.status(200).send("API is running.");
});

const handleError: ErrorRequestHandler = (error: any, _req, res, _next) => {
  let code = Number(error?.status) || 500;

  if (error instanceof Error && error.message === "Origin not allowed") {
    code = 403;
  }

  if (![400, 403, 413].includes(code)) {
    code = 500;
  }

  if (code === 500) {
    console.error("Unhandled API error:", error);
  }

  const messages: Record<number, string> = {
    400: "Invalid request body",
    403: "Origin not allowed",
    413: "Request body is too large",
    500: "Internal server error",
  };

  res.status(code).json({
    success: false,
    error: messages[code],
  });
};

app.use(handleError);

export default app;
