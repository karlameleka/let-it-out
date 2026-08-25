import "server-only";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getSessionSecretKey } from "@/lib/session-edge";
import {
  THERAPIST_SESSION_COOKIE,
  verifyTherapistSessionToken,
  type TherapistSessionPayload,
} from "@/lib/therapist-session-edge";

export { THERAPIST_SESSION_COOKIE, type TherapistSessionPayload };

// A separate cookie/JWT from the client User session (lio_session) — a
// therapist portal login isn't a User account, and keeping the payload
// shapes apart avoids widening every existing requireUser()/role check in
// the app to account for a third kind of session.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createTherapistSession(payload: TherapistSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSessionSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(THERAPIST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyTherapistSession() {
  const cookieStore = await cookies();
  cookieStore.delete(THERAPIST_SESSION_COOKIE);
}

export async function getCurrentCounselor(): Promise<TherapistSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(THERAPIST_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyTherapistSessionToken(token);
}

export async function requireCounselor(): Promise<TherapistSessionPayload> {
  const counselor = await getCurrentCounselor();
  if (!counselor) {
    throw new Error("UNAUTHENTICATED");
  }
  return counselor;
}
