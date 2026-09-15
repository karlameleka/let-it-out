"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAssessmentResults } from "@/lib/local-assessments";
import { ASSESSMENTS, scoreAssessment, type AssessmentSlug } from "@/lib/assessments";

const SLUGS = Object.keys(ASSESSMENTS) as AssessmentSlug[];

type Summary = { slug: AssessmentSlug; title: string; topLabel: string; count: number; lastTaken: string };

type Dict = {
  empty: string;
  emptyCta: string;
  topLabel: string;
  resultsCountOne: string;
  resultsCountMany: string;
};

/** Client-rendered because results live only in this browser's encrypted
 * IndexedDB (see local-assessments.ts) — nothing to fetch server-side. */
export default function MyAssessmentsList({ userId, dict }: { userId: string; dict: Dict }) {
  const [summaries, setSummaries] = useState<Summary[] | null>(null);

  useEffect(() => {
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

  if (summaries === null) return null;

  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center">
        <p className="text-sm text-ink/60">{dict.empty}</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {dict.emptyCta} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {summaries.map((s) => {
        const dateLabel = new Date(s.lastTaken).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const countLabel = (s.count === 1 ? dict.resultsCountOne : dict.resultsCountMany)
          .replace("{n}", String(s.count))
          .replace("{date}", dateLabel);
        return (
          <Link
            key={s.slug}
            href={`/qr/${s.slug}`}
            className="rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
          >
            <p className="font-display font-semibold text-brand-900">{s.title}</p>
            <p className="mt-1.5 text-xs text-ink/50">{dict.topLabel.replace("{label}", s.topLabel)}</p>
            <p className="mt-0.5 text-xs text-ink/40">{countLabel}</p>
          </Link>
        );
      })}
    </div>
  );
}
