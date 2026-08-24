// Deliberately no `import "server-only"` here — this file is shared by
// session.ts (Server Components/Actions) AND middleware.ts (Edge Runtime).
// It only depends on `jose`, which runs in both environments; it must never
// import next/headers, bcryptjs, or Prisma.
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "lio_session";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  role: "USER" | "ADMIN";
};

export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/** Pure JWT verification, no cookies() call — usable from both
 * getCurrentUser() (Server Components/Actions) and middleware.ts. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      phone: (payload.phone as string | null) ?? null,
      role: payload.role as "USER" | "ADMIN",
    };
  } catch {
    return null;
  }
}
