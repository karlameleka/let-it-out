"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import type { Article, ArticleSection } from "@/lib/content/articles";
import { getArticleProgress, saveArticleProgress } from "@/lib/article-progress";

function milestoneKey(index: number) {
  return `section-${index}`;
}

export default function InteractiveArticle({ article }: { article: Article }) {
  const totalMilestones = article.sections.length + 1; // +1 for the check-in itself
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [checkInAnswer, setCheckInAnswer] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved progress after mount only, so the server-rendered and
  // first client render stay identical and we avoid a hydration mismatch.
  useEffect(() => {
    const saved = getArticleProgress(article.slug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompleted(new Set(saved.completed));
    setCheckInAnswer(saved.checkInAnswer);
    setHydrated(true);
  }, [article.slug]);

  function markComplete(key: string) {
    setCompleted((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveArticleProgress(article.slug, { completed: [...next], checkInAnswer });
      return next;
    });
  }

  function answerCheckIn(option: string) {
    setCheckInAnswer(option);
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add("checkin");
      saveArticleProgress(article.slug, { completed: [...next], checkInAnswer: option });
      return next;
    });
  }

  const answered = checkInAnswer !== null;
  const progressCount = completed.size;
  const isComplete = progressCount >= totalMilestones;
  const percent = Math.min(100, Math.round((progressCount / totalMilestones) * 100));

  const [firstSection, ...restSections] = article.sections;

  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <p className="text-sm text-ink/50">
          {isComplete ? "Completed" : `${article.readMinutes} min read`}
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
        <ArticleSectionBlock section={firstSection} onSeen={() => markComplete(milestoneKey(0))} />

        <div className="mt-10 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-6 sm:p-8">
          {!answered ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Quick check-in</p>
              <p className="mt-2 font-display text-lg font-medium text-brand-900">{article.checkIn.prompt}</p>
              <div className="mt-4 flex flex-col gap-2">
                {article.checkIn.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => answerCheckIn(option)}
                    className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-left text-sm text-ink/80 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/40">
                Pick whatever&apos;s true for you — the rest of the article unlocks either way.
              </p>
            </>
          ) : (
            <div className="animate-pop-in flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
                ✓
              </span>
              <p className="text-sm text-ink/70">
                Got it — <span className="font-medium text-ink/90">&ldquo;{checkInAnswer}&rdquo;</span>. Here&apos;s
                the rest.
              </p>
            </div>
          )}
        </div>

        {answered && (
          <div className="animate-pop-in">
            {restSections.slice(0, -1).map((section, i) => (
              <ArticleSectionBlock
                key={section.heading}
                section={section}
                onSeen={() => markComplete(milestoneKey(i + 1))}
              />
            ))}
            {restSections.length > 0 && <ArticleSectionContent section={restSections[restSections.length - 1]} />}

            <div className="mt-10 border-t border-brand-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">References</p>
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
                {isComplete ? "Nice — you made it to the end." : "Want more support than a good read?"}
              </p>
              <p className="mt-2 text-sm text-ink/70">
                Our psychologist-led team offers 1:1 counseling and workplace workshops built on the same
                evidence-based approach.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/counseling">Book a session</ButtonLink>
                <ButtonLink href="/workshops" variant="outline">
                  Explore workshops
                </ButtonLink>
              </div>
            </div>

            {/* Placed at the true end of the content so an instant jump-to-bottom
                (keyboard End, "scroll to bottom" affordances) still fires the last
                milestone, not just a gradual scroll through the last section. */}
            <Sentinel onSeen={() => markComplete(milestoneKey(article.sections.length - 1))} />
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href="/resources" className="font-medium text-brand-600 underline">
          &larr; Back to all resources
        </Link>
      </p>
    </>
  );
}

function ArticleSectionBlock({ section, onSeen }: { section: ArticleSection; onSeen: () => void }) {
  return (
    <ArticleSectionContent section={section}>
      <Sentinel onSeen={onSeen} />
    </ArticleSectionContent>
  );
}

function ArticleSectionContent({
  section,
  children,
}: {
  section: ArticleSection;
  children?: ReactNode;
}) {
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
      {children}
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
