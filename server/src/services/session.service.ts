import { createHash, randomBytes } from "node:crypto";
import type { Response } from "express";
import config from "../config/index.js";
import { pool } from "../prisma/pool.js";

const ttlMs = 7 * 24 * 60 * 60 * 1000;
const cookieName = config.production
  ? "__Host-mireth_session"
  : "mireth_session";
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const cookieOptions = `Path=/; HttpOnly; SameSite=${config.sessionSameSite}${config.production ? "; Secure" : ""}`;

export function readSessionCookie(header = "") {
  const item = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (!item) return "";
  try {
    return decodeURIComponent(item.slice(cookieName.length + 1));
  } catch {
    return "";
  }
}

export async function createSession(userId: number, response: Response) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlMs);
  await pool.query(
    'INSERT INTO "Session" ("tokenHash", "userId", "expiresAt") VALUES ($1, $2, $3)',
    [hashToken(token), userId, expiresAt],
  );
  response.append(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(token)}; ${cookieOptions}; Max-Age=${ttlMs / 1000}; Expires=${expiresAt.toUTCString()}`,
  );
}

export async function findSessionUser(token: string) {
  if (!token) return null;
  const { rows } = await pool.query(
    'SELECT u."id", u."email", u."name", u."avatar" FROM "Session" s JOIN "User" u ON u."id" = s."userId" WHERE s."tokenHash" = $1 AND s."expiresAt" > NOW()',
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function revokeSession(token: string) {
  if (token)
    await pool.query('DELETE FROM "Session" WHERE "tokenHash" = $1', [
      hashToken(token),
    ]);
}

export function clearSessionCookie(response: Response) {
  response.append(
    "Set-Cookie",
    `${cookieName}=; ${cookieOptions}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
}
