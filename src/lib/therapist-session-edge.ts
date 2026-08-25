// Edge-safe counterpart to therapist-session.ts, mirroring session-edge.ts:
// no next/headers or server-only, so this can run from proxy.ts too.
import { jwtVerify } from "jose";
import { getSessionSecretKey } from "@/lib/session-edge";

export const THERAPIST_SESSION_COOKIE = "lio_therapist_session";

export type TherapistSessionPayload = {
  counselorId: string;
  email: string;
  name: string;
};

export async function verifyTherapistSessionToken(token: string): Promise<TherapistSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey());
    return {
      counselorId: payload.counselorId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
