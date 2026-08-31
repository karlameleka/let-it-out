import "server-only";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getSessionSecretKey } from "@/lib/session-edge";
import { prisma } from "@/lib/db";
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
//
// Short-lived by design: once this expires (or a one-click login link from
// sendTherapistLoginLink expires/is already used), the therapist is simply
// redirected to /therapist/login where they can sign back in themselves
// with their own email/password at any time — this isn't a lockout, just a
// session boundary.
const MAX_AGE_SECONDS = 60 * 70; // 70 minutes

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

  const session = await verifyTherapistSessionToken(token);
  if (!session) return null;

  // Same reasoning as getCurrentUser() in session.ts: the JWT itself stays
  // valid for its full lifetime regardless of what happens to the
  // counselor row, so a deleted counselor (from the admin dashboard) would
  // otherwise keep portal access until the cookie expires. Checking
  // existence here — the single funnel every /therapist page/action reads
  // the session through — makes deletion take effect immediately instead.
  const exists = await prisma.counselor.findUnique({ where: { id: session.counselorId }, select: { id: true } });
  if (!exists) {
    await destroyTherapistSession().catch(() => {});
    return null;
  }

  return session;
}

export async function requireCounselor(): Promise<TherapistSessionPayload> {
  const counselor = await getCurrentCounselor();
  if (!counselor) {
    throw new Error("UNAUTHENTICATED");
  }
  return counselor;
}
