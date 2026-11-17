import type { NextFunction, Request, Response } from "express";
import type { TokenPayload } from "google-auth-library";
import config from "../../config/index.js";
import {
  signInWithGoogle,
  verifyGoogleCredential,
} from "../../services/auth.service.js";
import {
  clearSessionCookie,
  createSession,
  findSessionUser,
  readSessionCookie,
  revokeSession,
} from "../../services/session.service.js";

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length > 10_000) {
    return res
      .status(400)
      .json({ success: false, error: "A valid Google credential is required" });
  }
  if (!config.googleClientId) {
    return res
      .status(503)
      .json({ success: false, error: "Google sign-in is not configured" });
  }
  let payload: TokenPayload;
  try {
    payload = await verifyGoogleCredential(credential);
  } catch {
    return res
      .status(401)
      .json({ success: false, error: "Google sign-in could not be verified" });
  }
  try {
    const user = await signInWithGoogle(payload);
    await createSession(user.id, res);
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  const user = await findSessionUser(readSessionCookie(req.headers.cookie));
  if (!user) clearSessionCookie(res);
  return res.json({ success: true, data: { user } });
}

export async function logout(req: Request, res: Response) {
  await revokeSession(readSessionCookie(req.headers.cookie));
  clearSessionCookie(res);
  return res.status(204).end();
}
