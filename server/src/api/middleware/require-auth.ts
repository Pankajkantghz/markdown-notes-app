import type { NextFunction, Request, Response } from "express";
import type { TokenPayload } from "google-auth-library";
import config from "../../config/index.js";
import {
  findUserByGoogleId,
  verifyGoogleCredential,
} from "../../services/auth.service.js";

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

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!config.googleClientId) {
    return res
      .status(503)
      .json({ success: false, error: "Google sign-in is not configured" });
  }
  const credential = /^Bearer\s+(.+)$/i.exec(
    req.get("authorization") || "",
  )?.[1];
  if (!credential) {
    return res
      .status(401)
      .json({ success: false, error: "Sign in is required" });
  }

  let payload: TokenPayload;
  try {
    payload = await verifyGoogleCredential(credential);
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Google sign-in expired or invalid" });
  }
  const user = await findUserByGoogleId(payload.sub!);
  if (!user)
    return res
      .status(401)
      .json({ success: false, error: "Sign in again to continue" });
  req.authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  };
  return next();
}
