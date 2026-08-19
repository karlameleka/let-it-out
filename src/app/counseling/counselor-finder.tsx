"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { counselorMatchesSearch } from "@/lib/counseling-search-keywords";

type Counselor = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialties: string[];
  languages: string[];
  photoUrl: string | null;
  availabilityStatus: "AVAILABLE" | "WAITLIST" | "UNAVAILABLE";
};

function AvailabilityBadge({
  status,
  dict,
}: {
  status: Counselor["availabilityStatus"];
  dict: Dictionary["counseling"];
}) {
  if (status === "AVAILABLE") return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "WAITLIST" ? "bg-amber-100 text-amber-800" : "bg-ink/10 text-ink/60"
      }`}
    >
      {status === "WAITLIST" ? dict.waitlistBadge : dict.unavailableBadge}
    </span>
  );
}

export default function CounselorFinder({
  counselors,
  dict,
}: {
  counselors: Counselor[];
  dict: Dictionary;
}) {
  const t = dict.counseling;
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => counselors.filter((c) => counselorMatchesSearch(c, query)),
    [counselors, query],
  );

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" strokeWidth={2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-2xl border border-brand-200 bg-white ps-11 pe-11 py-3.5 text-sm font-medium text-ink/80 outline-none transition-colors placeholder:text-ink/40 focus:border-brand-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t.clear}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/40 transition-colors hover:bg-brand-50 hover:text-ink/70"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">
          {t.emptyStateText}{" "}
          <Link href="/contact" className="font-medium text-brand-600 underline">
            {t.emptyStateLink}
          </Link>{" "}
          {t.emptyStateSuffix}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <Link
              key={c.id}
              href={`/counseling/${c.slug}`}
              className="group flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-7 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
            >
              {c.photoUrl ? (
                <Image
                  src={c.photoUrl}
                  alt={c.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover transition-colors duration-300 group-hover:border-white/30 group-active:border-white/30"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700 transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white group-active:border-white/30 group-active:bg-white/10 group-active:text-white">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">{c.name}</h3>
                <AvailabilityBadge status={c.availabilityStatus} dict={t} />
              </div>
              <p className="mt-1 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{c.credentials}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white group-active:bg-white/10 group-active:text-white">
                    {s}
                  </span>
                ))}
              </div>
              {c.languages.length > 0 && (
                <p className="mt-3 text-xs text-ink/50 transition-colors duration-300 group-hover:text-white/60 group-active:text-white/60">
                  <span className="font-medium text-ink/60 transition-colors duration-300 group-hover:text-white/80 group-active:text-white/80">{t.speaks}:</span> {c.languages.join(", ")}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                {t.viewProfileCta} &rarr;
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
