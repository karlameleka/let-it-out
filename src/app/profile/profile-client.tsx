"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { getMoodPatterns, type MoodPatterns } from "@/lib/local-journal";
import { getFavoriteArticleSlugs } from "@/lib/article-favorites";
import type { Article } from "@/lib/content/articles";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

/** Mood patterns and favorite articles both live only on this device (see
 * local-journal.ts / article-favorites.ts) — nothing here is fetched from
 * the server, so this whole section is a client component that reads
 * after mount, same hydration-mismatch avoidance as the other
 * local-journal-backed pages (patterns-client.tsx, article-progress-badge). */
export default function ProfileClient({
  userId,
  locale,
  articles,
  dict,
}: {
  userId: string;
  locale: Locale;
  articles: Article[];
  dict: Dictionary["profile"];
}) {
  const [moodPatterns, setMoodPatterns] = useState<MoodPatterns | null>(null);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getMoodPatterns(userId, locale).then((patterns) => {
      if (!cancelled) setMoodPatterns(patterns);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoriteSlugs(getFavoriteArticleSlugs());
    return () => {
      cancelled = true;
    };
  }, [userId, locale]);

  const favoriteArticles = articles.filter((a) => favoriteSlugs.includes(a.slug)).slice(0, 5);

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{dict.moodTitle}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink/70">
          {moodPatterns === null ? (
            " "
          ) : moodPatterns.topMood ? (
            <>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: moodPatterns.topMood.color }}
              />
              {moodPatterns.topMood.label} · {moodPatterns.topMood.count}
            </>
          ) : (
            dict.moodEmpty
          )}
        </p>
        <Link href="/journal/patterns" className="mt-3 inline-block text-sm font-medium text-brand-600 link-grow w-fit">
          {dict.moodCta} <span className="inline-block rtl:-scale-x-100">&rarr;</span>
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{dict.favoritesTitle}</h2>
        {favoriteArticles.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">{dict.favoritesEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {favoriteArticles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/resources/${a.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-brand-100 px-3.5 py-2.5 text-sm text-ink/80 transition-colors hover:bg-brand-50 active:bg-brand-50"
                >
                  <Star className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} fill="currentColor" />
                  <span className="flex-1 truncate">{a.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/resources" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow w-fit">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.favoritesCta}
        </Link>
      </div>
    </div>
  );
}
