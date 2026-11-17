import dotenv from "dotenv";

process.env.NODE_ENV ||= "development";
dotenv.config();

const production = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 5000);
const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  (production ? "" : "http://localhost:5173,http://localhost:5174")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const sameSite = process.env.SESSION_COOKIE_SAME_SITE || "lax";
const trustProxyValue = process.env.TRUST_PROXY;
const trustProxy =
  trustProxyValue === undefined ? false : Number(trustProxyValue);
const languageToolUrl =
  process.env.LANGUAGETOOL_URL?.trim().replace(/\/$/, "") || "";
const databaseUrl = process.env.DATABASE_URL || "";

if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be between 1 and 65535");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
if (!languageToolUrl)
  throw new Error(
    "LANGUAGETOOL_URL must be set (for local development, use http://localhost:8010)",
  );
try {
  if (!["http:", "https:"].includes(new URL(languageToolUrl).protocol))
    throw new Error();
} catch {
  throw new Error("LANGUAGETOOL_URL must be a valid HTTP or HTTPS URL");
}
if (production) {
  let sslMode = "";
  try {
    sslMode = new URL(databaseUrl).searchParams.get("sslmode") || "";
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }
  if (sslMode !== "verify-full")
    throw new Error("Production DATABASE_URL must set sslmode=verify-full");
}
if (production && !clientOrigins.length)
  throw new Error(
    "CLIENT_ORIGINS must list the deployed frontend origin in production",
  );
if (
  clientOrigins.some((origin) => {
    try {
      return (
        new URL(origin).origin !== origin ||
        (production && !origin.startsWith("https://"))
      );
    } catch {
      return true;
    }
  })
)
  throw new Error(
    "CLIENT_ORIGINS must contain exact origins without paths; production origins must use HTTPS",
  );
if (!["lax", "strict", "none"].includes(sameSite))
  throw new Error("SESSION_COOKIE_SAME_SITE must be lax, strict, or none");
if (production && !process.env.GOOGLE_CLIENT_ID?.trim())
  throw new Error("GOOGLE_CLIENT_ID is required in production");
if (production && !languageToolUrl.startsWith("https://"))
  throw new Error("LANGUAGETOOL_URL must use HTTPS in production");
if (production && trustProxyValue === undefined)
  throw new Error(
    "Set TRUST_PROXY to the number of trusted reverse proxies in production (use 0 when direct)",
  );
if (sameSite === "none" && !production)
  throw new Error("SameSite=None requires HTTPS; use it only in production");
if (
  typeof trustProxy === "number" &&
  (!Number.isSafeInteger(trustProxy) || trustProxy < 0)
)
  throw new Error("TRUST_PROXY must be a nonnegative trusted proxy hop count");

export default {
  production,
  host: process.env.HOST?.trim() || (production ? "0.0.0.0" : "127.0.0.1"),
  port,
  trustProxy,
  clientOrigins,
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
  databaseUrl,
  languageToolUrl,
  sessionSameSite: sameSite as "lax" | "strict" | "none",
};
