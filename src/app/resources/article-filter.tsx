"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Article } from "@/lib/content/articles";
import ArticleProgressBadge from "./article-progress-badge";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ArticleFilter({
  articles,
  hiddenSlugs = [],
  dict,
  progressDict,
}: {
  articles: Article[];
  hiddenSlugs?: string[];
  dict: Dictionary["articleFilter"];
  progressDict: Dictionary["articleProgressBadge"];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const visibleArticles = useMemo(
    () => articles.filter((a) => !hiddenSlugs.includes(a.slug)),
    [articles, hiddenSlugs]
  );

  const categories = useMemo(() => Array.from(new Set(visibleArticles.map((a) => a.category))), [visibleArticles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleArticles.filter((a) => {
      if (category && a.category !== category) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [visibleArticles, query, category]);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="w-full rounded-full border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              category === null
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400"
            }`}
          >
            {dict.allTopics}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">{dict.noMatches}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="group rounded-2xl border-[1.5px] border-brand-900 bg-white p-6 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
            >
              <p className="flex items-center text-xs font-semibold uppercase tracking-wide text-brand-500 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                {article.category} · {article.readMinutes} {dict.minRead}
                <ArticleProgressBadge
                  slug={article.slug}
                  totalMilestones={article.sections.length + article.checkIns.length}
                  dict={progressDict}
                />
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{article.excerpt}</p>
              <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                {dict.readArticle} &rarr;
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
