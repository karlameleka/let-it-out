import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTherapistSession } from "@/lib/therapist-session";

/**
 * Consumes a one-click therapist login link (see sendTherapistLoginLink in
 * admin-actions.ts). GET rather than a Server Action since this is reached
 * by clicking a link straight from an email, not submitting a form.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const loginUrl = new URL("/therapist/login", request.url);

  if (!token) {
    loginUrl.searchParams.set("linkError", "1");
    return NextResponse.redirect(loginUrl);
  }

  const loginTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const counselor = await prisma.counselor.findUnique({ where: { loginTokenHash } });

  if (!counselor || !counselor.loginTokenExpiresAt || counselor.loginTokenExpiresAt < new Date()) {
    loginUrl.searchParams.set("linkError", "1");
    return NextResponse.redirect(loginUrl);
  }

  await prisma.counselor.update({
    where: { id: counselor.id },
    data: {
      loginTokenHash: null,
      loginTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  await createTherapistSession({ counselorId: counselor.id, email: counselor.email ?? "", name: counselor.name });
  return NextResponse.redirect(new URL("/therapist", request.url));
}
