import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecretKey } from "@/lib/session-edge";

const CHALLENGE_COOKIE = "lio_webauthn_challenge";
const CHALLENGE_MAX_AGE_SECONDS = 5 * 60; // 5 minutes to complete the ceremony

type Purpose = "registration" | "authentication";

/**
 * Short-lived, purpose-scoped cookie holding the random challenge a WebAuthn
 * ceremony (registering a new Face ID/Touch ID credential, or using one to
 * unlock the journal) must sign and return — mirrors the pending-2FA cookie
 * pattern in session.ts rather than a DB table, since it only needs to
 * survive the single round trip between generating options and verifying
 * the response.
 */
export async function setWebAuthnChallenge(userId: string, challenge: string, purpose: Purpose) {
  const token = await new SignJWT({ userId, challenge, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
}

/** Returns the pending challenge only if it belongs to this user and this
 * exact ceremony purpose — a registration challenge can't be replayed to
 * satisfy an authentication verification or vice versa. */
export async function getWebAuthnChallenge(userId: string, purpose: Purpose): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey());
    if (payload.userId !== userId || payload.purpose !== purpose) return null;
    return payload.challenge as string;
  } catch {
    return null;
  }
}

export async function clearWebAuthnChallenge() {
  const cookieStore = await cookies();
  cookieStore.delete(CHALLENGE_COOKIE);
}
