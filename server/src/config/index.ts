import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error && process.env.NODE_ENV === "development") {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

// 1. Validate and parse PORT
const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

// 2. Parse and sanitize client origins
const clientOrigins = (
  process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export default {
  host: process.env.HOST?.trim() || "127.0.0.1",
  port,
  clientOrigins,
};
