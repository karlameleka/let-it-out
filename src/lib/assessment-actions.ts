"use server";

import { requireUser } from "@/lib/session";
import { trackEvent } from "@/lib/analytics-events";
import type { AssessmentSlug } from "@/lib/assessments";

/** QR self-assessment results live entirely in per-device encrypted
 * IndexedDB (see local-assessments.ts) — no answers or scores ever reach
 * the server. assessment-quiz.tsx calls this fire-and-forget on the
 * "Start the assessment" button and again right after a successful local
 * save, sending only the assessment type (never answers or a score), so
 * behavioral analytics can see completion rates and time-to-value without
 * the server ever holding any assessment content. */
export async function trackAssessmentEvent(
  slug: AssessmentSlug,
  action: "started" | "completed",
): Promise<void> {
  const session = await requireUser().catch(() => null);
  if (!session) return;
  void trackEvent(session.userId, "Assessment", action, { slug });
}
