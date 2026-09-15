import type { AssessmentSlug } from "@/lib/assessments";

/**
 * Maps each QR-only assessment to a long, random, unguessable token instead
 * of a readable slug — these are the only URLs printed in the physical
 * guided journals, and /qr is already disallowed in robots.txt, so this is
 * the difference between "reachable only by scanning the exact code in the
 * book" and "reachable by anyone who tries /qr/love-languages". Regenerating
 * a token invalidates every QR code already printed with it, so only do
 * that alongside a reprint.
 */
export const QR_TOKENS: Record<string, AssessmentSlug> = {
  "4415f8a41b02afe33bc1c3dd209e4b59": "love-languages",
  "2a282bc1f3f0ed1d44f0d288e9038976": "coping-strategies",
  "6256eab44f4a3a2e2957b6bf107efc63": "defense-mechanisms",
};
