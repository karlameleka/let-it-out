import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUpcomingCount } from "@/lib/upcoming-items";

/** Polled client-side (see upcoming-context.tsx) to drive the badge on the
 * header notification bell and the installed-app icon. Returns 0 for a
 * logged-out visitor rather than an error, since the badge should just
 * quietly show nothing. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const count = await getUpcomingCount(user.email, user.userId);
  return NextResponse.json({ count });
}
