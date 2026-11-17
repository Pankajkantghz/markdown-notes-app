import { OAuth2Client, type TokenPayload } from "google-auth-library";
import config from "../config/index.js";
import { db } from "../prisma/db.js";

const googleClient = new OAuth2Client();

export async function verifyGoogleCredential(
  credential: string,
): Promise<TokenPayload> {
  if (!config.googleClientId)
    throw new Error("Google sign-in is not configured");
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account is missing a verified email");
  }
  return payload;
}

export async function findUserByGoogleId(googleId: string) {
  return db.orm.public.User.first({ googleId });
}

export async function signInWithGoogle(payload: TokenPayload) {
  const profile = {
    email: payload.email!,
    name: payload.name || payload.email!,
    avatar: payload.picture ?? null,
  };
  const existing = await findUserByGoogleId(payload.sub!);
  if (existing) {
    return db.orm.public.User.where({ id: existing.id }).update(profile);
  }

  try {
    return await db.orm.public.User.create({
      googleId: payload.sub!,
      ...profile,
    });
  } catch (error) {
    // A concurrent first login may win the unique Google ID insert.
    const user = await findUserByGoogleId(payload.sub!);
    if (!user) throw error;
    return db.orm.public.User.where({ id: user.id }).update(profile);
  }
}
