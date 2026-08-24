import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, getSessionSecretKey, type SessionPayload } from "@/lib/session-edge";

export { SESSION_COOKIE, verifySessionToken, type SessionPayload };

const getSecretKey = getSessionSecretKey;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const PENDING_2FA_COOKIE = "lio_2fa_pending";
const PENDING_2FA_MAX_AGE_SECONDS = 5 * 60; // 5 minutes to enter the code

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * A password check has succeeded but the account has TOTP enabled — the
 * real session cookie isn't set yet. This short-lived, purpose-scoped
 * cookie is the only thing that authorizes reaching /login/verify's code
 * check; it carries no role/email, just enough to look the account back up.
 */
export async function createPendingTwoFactorSession(userId: string) {
  const token = await new SignJWT({ userId, purpose: "2fa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_2FA_MAX_AGE_SECONDS,
  });
}

export async function getPendingTwoFactorUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== "2fa_pending") return null;
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function clearPendingTwoFactorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_2FA_COOKIE);
}
