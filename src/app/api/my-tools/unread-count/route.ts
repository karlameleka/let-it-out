import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUnviewedAssignedResourceCount } from "@/lib/client-resources";

/** Polled client-side (see unread-tools-context.tsx) to drive the
 * unread-count badge on the Resources tab and the installed-app icon.
 * Returns 0 for a logged-out visitor rather than an error, since the
 * badge should just quietly show nothing. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const count = await getUnviewedAssignedResourceCount(user.email);
  return NextResponse.json({ count });
}
