"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Container } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { getAssessmentResults } from "@/lib/local-assessments";
import { ASSESSMENTS, type AssessmentSlug } from "@/lib/assessments";

const SLUGS = Object.keys(ASSESSMENTS) as AssessmentSlug[];

/**
 * "My Assessments" — a single promo card matching the exact visual pattern
 * of the journal/CBT/breathing promo cards above it (icon badge, big
 * colored card, flex-col on mobile / flex-row on desktop), except this one
 * has a locked and an unlocked destination instead of always linking
 * straight to the feature:
 *
 *   - Locked (default, and for guests): the assessments themselves are
 *     reachable only by scanning the QR code printed inside a physical
 *     guided journal (see src/app/qr/*) — this state links to the shop
 *     instead, to sell the journal.
 *   - Unlocked (once at least one result exists in this browser's local
 *     assessment storage): links to /resources/my-assessments, the fuller
 *     results page, so the visitor has a way back to their own results
 *     without re-scanning the code every time.
 *
 * Title/eyebrow/description stay the same in both states — only the CTA
 * text and destination change. Defaults to locked and only flips to
 * unlocked once the (fast, local) IndexedDB check resolves, rather than
 * showing a loading placeholder — avoids a layout-shifting flash for the
 * common case (nothing unlocked yet).
 */
export default function MyAssessmentsPromo({
  userId,
  label,
  title,
  description,
  ctaLocked,
  ctaUnlocked,
}: {
  userId?: string;
  label: string;
  title: string;
  description: string;
  ctaLocked: string;
  ctaUnlocked: string;
}) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.all(SLUGS.map((slug) => getAssessmentResults(userId, slug)));
      const hasAny = results.some((entries) => entries.length > 0);
      if (!cancelled && hasAny) setUnlocked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const href = unlocked ? "/resources/my-assessments" : "/shop";
  const cta = unlocked ? ctaUnlocked : ctaLocked;

  return (
    <section className="pt-2 pb-8 sm:py-10" key="assessments-promo">
      <Reveal>
        <Container>
          <Link
            href={href}
            className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-800 bg-brand-800 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              {unlocked ? (
                <Sparkles className="h-6 w-6" strokeWidth={1.75} />
              ) : (
                <Lock className="h-6 w-6" strokeWidth={1.75} />
              )}
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">{label}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">{description}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              {cta} <span className="inline-block rtl:-scale-x-100">&rarr;</span>
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );
}
