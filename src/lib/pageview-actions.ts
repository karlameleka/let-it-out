"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Records that a logged-in user opened a page — the only signal behind the
 * admin analytics page's "most/least used features" and "time spent"
 * numbers (see src/lib/analytics.ts). Deliberately best-effort and silent:
 * a dropped pageview should never surface as an error to whoever's
 * browsing, and logged-out/anonymous visits are never recorded at all.
 */
export async function logPageView(path: string): Promise<void> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return;
  await prisma.pageView.create({ data: { userId: user.userId, path } }).catch(() => {});
}
