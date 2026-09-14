"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { getAssessmentResults } from "@/lib/local-assessments";
import { ASSESSMENTS, scoreAssessment, type AssessmentSlug } from "@/lib/assessments";

const SLUGS = Object.keys(ASSESSMENTS) as AssessmentSlug[];

type Summary = { slug: AssessmentSlug; title: string; topLabel: string; count: number; lastTaken: string };

/**
 * "My Assessments" — a Self-Exploration-themed promo section matching the
 * visual pattern of the journal/CBT/breathing promo cards above it, except
 * this one has a locked and an unlocked state instead of always linking
 * straight to the feature:
 *
 *   - Locked (default, and for guests): the assessments themselves are
 *     reachable only by scanning the QR code printed inside a physical
 *     guided journal (see src/app/qr/*) — this state doesn't link to them
 *     directly, it sells the journal instead.
 *   - Unlocked (once at least one result exists in this browser's local
 *     assessment storage): shows the visitor's own results, so they have a
 *     way back to them without re-scanning the code every time.
 *
 * Defaults to locked and only flips to unlocked once the (fast, local)
 * IndexedDB check resolves, rather than showing a loading placeholder —
 * avoids a layout-shifting flash for the common case (nothing unlocked yet).
 */
export default function MyAssessmentsPromo({ userId }: { userId?: string }) {
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const all = await Promise.all(
        SLUGS.map(async (slug) => {
          const entries = await getAssessmentResults(userId, slug);
          if (entries.length === 0) return null;
          const definition = ASSESSMENTS[slug];
          const latest = entries[0];
          const answersMap = Object.fromEntries(latest.answers.map((a) => [a.questionId, a.value]));
          const score = scoreAssessment(definition, answersMap);
          const summary: Summary = {
            slug,
            title: definition.title,
            topLabel: score[0]?.label ?? "",
            count: entries.length,
            lastTaken: latest.createdAt,
          };
          return summary;
        }),
      );
      if (!cancelled) setSummaries(all.filter((s): s is Summary => s !== null));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (summaries.length === 0) {
    return (
      <section className="pt-2 pb-8 sm:py-10" key="assessments-promo">
        <Reveal>
          <Container>
            <Link
              href="/shop"
              className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-800 bg-brand-800 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Lock className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Self-Exploration</p>
                <h3 className="mt-1 font-display text-xl font-semibold">My Assessments</h3>
                <p className="mt-1.5 text-sm text-brand-50/85">
                  Locked — Love Languages, Coping Strategies, and Defense Mechanisms self-assessments are tucked
                  inside our guided journals. Scan the QR code in your copy to unlock them here.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
                Shop guided journals <span className="inline-block rtl:-scale-x-100">&rarr;</span>
              </span>
            </Link>
          </Container>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="pt-2 pb-8 sm:py-10" key="assessments-promo">
      <Reveal>
        <Container>
          <SectionHeading
            eyebrow="Self-Exploration"
            title="My Assessments"
            description="Results from the assessments you've taken via the QR code in your guided journal. Tap any of them to revisit your results or retake it."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {summaries.map((s) => {
              const dateLabel = new Date(s.lastTaken).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <Link
                  key={s.slug}
                  href={`/qr/${s.slug}`}
                  className="rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
                >
                  <p className="font-display font-semibold text-brand-900">{s.title}</p>
                  <p className="mt-1.5 text-xs text-ink/50">Top: {s.topLabel}</p>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {s.count} result{s.count === 1 ? "" : "s"} · last taken {dateLabel}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
