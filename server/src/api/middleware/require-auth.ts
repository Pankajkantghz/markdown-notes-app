import type { NextFunction, Request, Response } from "express";
import config from "../../config/index.js";
import {
  clearSessionCookie,
  findSessionUser,
  readSessionCookie,
} from "../../services/session.service.js";

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export function requireTrustedRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.get("origin");
  const serverOrigin = `${req.protocol}://${req.get("host")}`;
  if (
    req.get("x-mireth-request") !== "1" ||
    (origin &&
      !config.clientOrigins.includes(origin) &&
      origin !== serverOrigin)
  ) {
    return res
      .status(403)
      .json({ success: false, error: "Request origin is not allowed" });
  }
  return next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.get("x-mireth-request") !== "1") {
    return res
      .status(403)
      .json({ success: false, error: "Request origin is not allowed" });
  }
  const origin = req.get("origin");
  const serverOrigin = `${req.protocol}://${req.get("host")}`;
  if (
    origin &&
    !config.clientOrigins.includes(origin) &&
    origin !== serverOrigin
  ) {
    return res
      .status(403)
      .json({ success: false, error: "Request origin is not allowed" });
  }
  const token = readSessionCookie(req.headers.cookie);
  const user = await findSessionUser(token);
  if (!user) {
    clearSessionCookie(res);
    return res
      .status(401)
      .json({ success: false, error: "Sign in to continue" });
  }
  req.authUser = user as AuthenticatedUser;
  return next();
}
