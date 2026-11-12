import "dotenv/config";

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

export const PORT = port;
export const HOST = process.env.HOST?.trim() || "127.0.0.1";
export const CLIENT_ORIGINS = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,https://your-production-domain.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
