"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";

export default function SiteSearch({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
      .slice(0, 20);
  }, [index, query]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
        aria-label="Search"
        className="inline-flex items-center justify-center rounded-md p-2 text-ink/70 transition-colors hover:text-brand-600 active:text-brand-600"
      >
        <Search className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/50 p-4 pt-20 backdrop-blur-sm sm:pt-28"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-pop-in w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-brand-100 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-ink/40" strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, journals, counselors, workshops..."
                className="w-full text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1 text-ink/40 transition-colors hover:bg-brand-50 hover:text-ink/70"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() === "" ? (
                <p className="px-3 py-8 text-center text-sm text-ink/50">
                  Search articles, journals, counselors, and workshop topics.
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-ink/50">
                  No results for &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {results.map((item, i) => (
                    <li key={`${item.type}-${item.href}-${i}`}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50 active:bg-brand-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                            {item.typeLabel}
                          </span>
                          <p className="truncate text-sm font-medium text-brand-900">{item.title}</p>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink/50">{item.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
