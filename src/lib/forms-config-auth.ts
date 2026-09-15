import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { requireCounselor } from "@/lib/therapist-session";

/**
 * The intake form and reflection sheet configs are a single shared,
 * sitewide record each (id: "singleton") — not per-counselor. Editing
 * either is normally admin-only, but a counselor with
 * Counselor.canEditFormsConfig set (granted by an admin from
 * /admin/counselors/[id]) can also save changes, from their own
 * /therapist portal. Throws on failure, matching requireAdmin/
 * requireCounselor's own contract.
 */
export async function requireFormsConfigEditor(): Promise<void> {
  const admin = await requireAdmin().catch(() => null);
  if (admin) return;

  const session = await requireCounselor().catch(() => null);
  if (!session) throw new Error("UNAUTHENTICATED");

  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { canEditFormsConfig: true },
  });
  if (!counselor?.canEditFormsConfig) throw new Error("FORBIDDEN");
}
