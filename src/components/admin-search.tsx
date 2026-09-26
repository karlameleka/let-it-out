"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchAdminClients } from "@/lib/admin-actions";

type ClientResult = { id: string; name: string; email: string; accountCode: string };
type PageTab = { href: string; label: string };

/** Global admin search — typing filters the nav's own pages instantly
 * (client-side, no round trip) and, after a short debounce, also searches
 * clients by name/email/account code. Picking either jumps straight there.
 * Lives in the admin layout so it's available from every /admin page. */
export default function AdminSearch({ tabs }: { tabs: PageTab[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientResult[]>([]);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matchedTabs =
    query.trim().length === 0
      ? []
      : tabs.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timeout = setTimeout(() => {
      searchAdminClients(q)
        .then(setClients)
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (value.trim().length < 2) setClients([]);
    else setSearching(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults = matchedTabs.length > 0 || clients.length > 0;
  const showEmpty = query.trim().length >= 2 && !searching && !hasResults;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" strokeWidth={2} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search clients or jump to a page…"
          className="w-full rounded-full border border-brand-200 bg-white py-2 pl-9 pr-8 text-sm text-ink outline-none focus:border-brand-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setClients([]);
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-brand-200 bg-white shadow-lg">
          {matchedTabs.length > 0 && (
            <div className="border-b border-brand-50 py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Pages</p>
              {matchedTabs.map((t) => (
                <button
                  key={t.href}
                  type="button"
                  onClick={() => go(t.href)}
                  className="block w-full px-3 py-1.5 text-left text-sm text-ink/80 hover:bg-brand-50"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {(clients.length > 0 || searching) && (
            <div className="py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Clients</p>
              {searching && clients.length === 0 && <p className="px-3 py-1.5 text-sm text-ink/40">Searching…</p>}
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => go(`/admin/clients/${c.id}`)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-brand-50"
                >
                  <span>
                    <span className="font-medium text-ink/80">{c.name}</span>{" "}
                    <span className="text-ink/45">{c.email}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                    {c.accountCode}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showEmpty && <p className="px-3 py-2.5 text-sm text-ink/40">No matches for &ldquo;{query}&rdquo;.</p>}
        </div>
      )}
    </div>
  );
}
