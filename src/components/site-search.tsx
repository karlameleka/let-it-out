"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";

export default function SiteSearch({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
      .slice(0, 8);
  }, [index, query]);

  return (
    <div ref={containerRef} className={`relative flex items-center ${open ? "flex-1 md:flex-none" : ""}`}>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
          aria-label="Search"
          className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-ink/70 transition-colors hover:text-brand-600 active:text-brand-600"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
      ) : (
        <div className="flex w-full items-center gap-2 rounded-full border-[1.5px] border-brand-300 bg-white py-1.5 pl-3.5 pr-2 shadow-sm transition-all md:w-64 lg:w-72">
          <Search className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="shrink-0 rounded-full p-1 text-ink/40 transition-colors hover:bg-brand-50 hover:text-ink/70"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {open && query.trim() !== "" && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl sm:w-96">
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink/50">
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
      )}
    </div>
  );
}
