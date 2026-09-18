"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FaqList } from "@/components/faq";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { HelpCenterCategory } from "@/lib/i18n/dictionaries/en";

type Faq = { category: HelpCenterCategory; question: string; answer: string };

const CATEGORIES: HelpCenterCategory[] = ["counseling", "shop", "workshops", "resources", "technical"];

export default function HelpCenterFilter({ faqs, dict }: { faqs: Faq[]; dict: Dictionary["helpCenter"] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCenterCategory | null>(null);

  const categoryLabels: Record<HelpCenterCategory, string> = {
    counseling: dict.categoryCounseling,
    shop: dict.categoryShop,
    workshops: dict.categoryWorkshops,
    resources: dict.categoryResources,
    technical: dict.categoryTechnical,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (category && f.category !== category) return false;
      if (!q) return true;
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [faqs, query, category]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
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
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory((current) => (current === c ? null : c))}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400"
              }`}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">{dict.noMatches}</p>
      ) : (
        <div className="mt-8">
          <FaqList items={filtered} />
        </div>
      )}
    </>
  );
}
