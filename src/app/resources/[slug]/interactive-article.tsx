"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import type { Article, ArticleCheckIn, ArticleSection } from "@/lib/content/articles";
import { getArticleProgress, saveArticleProgress, clearArticleProgress } from "@/lib/article-progress";
import ResourceNotifyBell from "../resource-notify-bell";
import type { Dictionary } from "@/lib/i18n/dictionary";

function sectionKey(index: number) {
  return `section-${index}`;
}

function checkInKey(index: number) {
  return `checkin-${index}`;
}

type Progress = { completed: Set<string>; checkInAnswers: (string | null)[] };

export default function InteractiveArticle({
  article,
  dict,
  notifyDict,
}: {
  article: Article;
  dict: Dictionary["interactiveArticle"];
  notifyDict: Dictionary["resourceNotifyBell"];
}) {
  const totalMilestones = article.sections.length + article.checkIns.length;
  const [progress, setProgress] = useState<Progress>(() => ({
    completed: new Set(),
    checkInAnswers: article.checkIns.map(() => null),
  }));
  const [hydrated, setHydrated] = useState(false);

  // Load any saved progress after mount only, so the server-rendered and
  // first client render stay identical and we avoid a hydration mismatch.
  useEffect(() => {
    const saved = getArticleProgress(article.slug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress({
      completed: new Set(saved.completed),
      checkInAnswers: article.checkIns.map((_, i) => saved.checkInAnswers[i] ?? null),
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.slug]);

  function markComplete(key: string) {
    setProgress((prev) => {
      if (prev.completed.has(key)) return prev;
      const completed = new Set(prev.completed);
      completed.add(key);
      saveArticleProgress(article.slug, { completed: [...completed], checkInAnswers: prev.checkInAnswers });
      return { completed, checkInAnswers: prev.checkInAnswers };
    });
  }

  function handleRestart() {
    clearArticleProgress(article.slug);
    setProgress({ completed: new Set(), checkInAnswers: article.checkIns.map(() => null) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function answerCheckIn(index: number, option: string) {
    setProgress((prev) => {
      const checkInAnswers = [...prev.checkInAnswers];
      checkInAnswers[index] = option;
      const completed = new Set(prev.completed);
      completed.add(checkInKey(index));
      saveArticleProgress(article.slug, { completed: [...completed], checkInAnswers });
      return { completed, checkInAnswers };
    });
  }

  const { completed, checkInAnswers } = progress;
  const progressCount = completed.size;
  const isComplete = progressCount >= totalMilestones;
  const percent = Math.min(100, Math.round((progressCount / totalMilestones) * 100));
  const allAnswered = checkInAnswers.every((a) => a !== null);

  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <p className="text-sm text-ink/50">
          {isComplete ? dict.completed : dict.minRead.replace("{n}", String(article.readMinutes))}
        </p>
        {hydrated && (
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-brand-500" : "bg-brand-300"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>

      <div className="mt-10">
        {article.sections.map((section, i) => {
          const unlocked = i === 0 || checkInAnswers[i - 1] !== null;
          if (!unlocked) return null;
          const isLastCheckIn = i === article.checkIns.length - 1;

          return (
            <div key={section.heading} className={i === 0 ? "" : "animate-pop-in"}>
              <ArticleSectionContent section={section} />
              <CheckInCard
                checkIn={article.checkIns[i]}
                answer={checkInAnswers[i]}
                onAnswer={(option) => answerCheckIn(i, option)}
                isLast={isLastCheckIn}
                dict={dict}
              />
              <Sentinel onSeen={() => markComplete(sectionKey(i))} />
            </div>
          );
        })}

        {allAnswered && (
          <div className="animate-pop-in">
            <div className="mt-10 border-t border-brand-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.referencesLabel}</p>
              <ol className="mt-2 space-y-1.5 text-xs text-ink/50">
                {article.references.map((ref, i) => (
                  <li key={i}>
                    {i + 1}. {ref}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-12 rounded-2xl border-2 border-brand-100 bg-brand-50 p-6 text-center">
              <p className="font-display font-semibold text-brand-800">
                {isComplete ? dict.niceMadeIt : dict.wantMoreSupport}
              </p>
              <p className="mt-2 text-sm text-ink/70">{dict.supportDescription}</p>
              {article.slug === "stress-management-for-employees" ? (
                <div className="mt-5 flex flex-col items-center gap-3">
                  <ButtonLink href="/workshops">{dict.exploreWorkshops}</ButtonLink>
                  <div className="flex flex-wrap justify-center gap-3">
                    <ButtonLink href="/shop" variant="outline">
                      {dict.exploreJournals}
                    </ButtonLink>
                    <ButtonLink href="/counseling" variant="outline">
                      {dict.bookSession}
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {article.slug === "importance-of-journaling" && (
                    <ButtonLink href="/shop">{dict.exploreJournals}</ButtonLink>
                  )}
                  <ButtonLink
                    href="/counseling"
                    variant={article.slug === "importance-of-journaling" ? "outline" : "primary"}
                  >
                    {dict.bookSession}
                  </ButtonLink>
                  <ButtonLink href="/workshops" variant="outline">
                    {dict.exploreWorkshops}
                  </ButtonLink>
                </div>
              )}
            </div>

            <ResourceNotifyBell dict={notifyDict} />
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/resources" className="font-medium text-brand-600 underline">
          &larr; {dict.backToResources}
        </Link>
        {progressCount > 0 && (
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 font-medium text-ink/50 transition-colors hover:text-ink/80 active:text-ink/80"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.retakeArticle}
          </button>
        )}
      </div>
    </>
  );
}

function CheckInCard({
  checkIn,
  answer,
  onAnswer,
  isLast,
  dict,
}: {
  checkIn: ArticleCheckIn;
  answer: string | null;
  onAnswer: (option: string) => void;
  isLast: boolean;
  dict: Dictionary["interactiveArticle"];
}) {
  return (
    <div className="mt-10 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-6 sm:p-8">
      {answer === null ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{dict.quickCheckIn}</p>
          <p className="mt-2 font-display text-lg font-medium text-brand-900">{checkIn.prompt}</p>
          <div className="mt-4 flex flex-col gap-2">
            {checkIn.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswer(option)}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-left text-sm text-ink/80 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/40">
            {dict.pickWhatsTrue.replace("{part}", isLast ? dict.partWrapUp : dict.partNext)}
          </p>
        </>
      ) : (
        <div className="animate-pop-in flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
            ✓
          </span>
          <p className="text-sm text-ink/70">
            {dict.gotItPrefix} <span className="font-medium text-ink/90">&ldquo;{answer}&rdquo;</span>.{" "}
            {isLast ? dict.gotItSuffixRest : dict.gotItSuffixNext}
          </p>
        </div>
      )}
    </div>
  );
}

function ArticleSectionContent({ section }: { section: ArticleSection }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-brand-900">{section.heading}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-ink/75 sm:text-base">
        {section.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {section.list && (
          <ul className="list-disc space-y-3 pl-5">
            {section.list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Sentinel({ onSeen }: { onSeen: () => void }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onSeen();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Only ever needs to run once — re-running on every render (which a fresh
    // `onSeen` reference would trigger) would just re-observe the same sentinel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={sentinelRef} aria-hidden="true" />;
}
