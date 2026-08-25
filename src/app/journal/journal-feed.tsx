"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, LockKeyhole, PlusCircle, Search, Star } from "lucide-react";
import { exportJournalEntries } from "@/lib/journal-actions";
import { getFeedData, toggleBookmark, migrateFromServer, type JournalFeedEntry, type JournalStats } from "@/lib/local-journal";
import { relockJournal } from "@/components/journal-lock-gate";
import { moodColor, moodLabel } from "@/lib/moods";
import { ButtonLink } from "@/components/ui";
import JournalDataNotice from "@/components/journal-data-notice";

export default function JournalFeed({
  userId,
  firstName,
  lockEnabled,
}: {
  userId: string;
  firstName: string;
  lockEnabled: boolean;
}) {
  const [entries, setEntries] = useState<JournalFeedEntry[] | null>(null);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [query, setQuery] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  useEffect(() => {
    async function load() {
      await migrateFromServer(userId, async () => (await exportJournalEntries())?.entries ?? []);
      const data = await getFeedData(userId);
      setEntries(data.entries);
      setStats(data.stats);
    }
    load();
  }, [userId]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (bookmarkedOnly && !e.bookmarked) return false;
      if (!q) return true;
      return e.content.toLowerCase().includes(q) || e.moods.some((m) => moodLabel(m).toLowerCase().includes(q));
    });
  }, [entries, query, bookmarkedOnly]);

  async function handleToggleBookmark(id: string) {
    setEntries((prev) => prev?.map((e) => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e)) ?? prev);
    const result = await toggleBookmark(userId, id);
    if (!result.success) {
      // revert on failure
      setEntries((prev) => prev?.map((e) => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e)) ?? prev);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">A self-exploration journey</p>
              <h1 className="mt-2 font-display text-3xl font-medium text-brand-900 sm:text-4xl">
                Hi {firstName}, welcome back
              </h1>
            </div>
            {lockEnabled && (
              <button
                type="button"
                onClick={relockJournal}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-2 text-xs font-medium text-ink/50 transition-colors hover:border-brand-300 active:border-brand-300 hover:text-ink/70 active:text-ink/70"
              >
                <LockKeyhole className="h-3.5 w-3.5" strokeWidth={2} />
                Lock
              </button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-stretch gap-4">
            <div className="flex divide-x divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
              <div className="px-6 py-3.5">
                <p className="font-display text-2xl font-semibold leading-none text-brand-900">
                  {stats?.streak ?? 0}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">day streak</p>
              </div>
              <div className="px-6 py-3.5">
                <p className="font-display text-2xl font-semibold leading-none text-brand-900">
                  {stats?.total ?? 0}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  {stats?.total === 1 ? "Entry" : "Entries"}
                </p>
              </div>
              <div className="px-6 py-3.5">
                <p className="font-display text-2xl font-semibold leading-none text-brand-900">
                  {stats?.totalWords ?? 0}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  {stats?.totalWords === 1 ? "word written" : "words written"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/journal/new">
                <PlusCircle className="h-4 w-4" strokeWidth={2} />
                New entry
              </ButtonLink>
              <Link
                href="/journal/patterns"
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 active:bg-brand-100"
              >
                <BarChart3 className="h-4 w-4" strokeWidth={2} />
                Mood patterns
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JournalDataNotice />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your entries..."
              className="w-full rounded-full border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setBookmarkedOnly((v) => !v)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
              bookmarkedOnly
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-brand-200 text-ink/60 hover:border-brand-300 active:border-brand-300"
            }`}
          >
            <Star className="h-4 w-4" strokeWidth={2} fill={bookmarkedOnly ? "currentColor" : "none"} />
            Bookmarked
          </button>
        </div>

        {entries === null ? (
          <div className="mt-8 animate-pulse space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl border-2 border-brand-100 bg-brand-50/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-200 bg-white text-brand-500">
              <BookOpen className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-ink/60">
              {entries.length === 0
                ? "Your entries will show up here once you save your first one."
                : "No entries match that search."}
            </p>
            {entries.length === 0 && (
              <ButtonLink href="/journal/new" className="mt-6">
                Write your first entry
              </ButtonLink>
            )}
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((e) => (
              <EntryCard key={e.id} entry={e} onToggleBookmark={() => handleToggleBookmark(e.id)} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EntryCard({ entry, onToggleBookmark }: { entry: JournalFeedEntry; onToggleBookmark: () => void }) {
  const router = useRouter();

  return (
    <li
      onClick={() => router.push(`/journal/${entry.id}`)}
      className="group flex cursor-pointer gap-4 rounded-2xl border-2 border-brand-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 active:-translate-y-0.5 hover:border-brand-300 active:border-brand-300 hover:shadow-md active:shadow-md"
    >
      {entry.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer
        <img
          src={entry.photoUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-ink/50">
            <span>
              {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {entry.moods.length > 0 && (
              <span className="flex items-center gap-1">
                {entry.moods.map((m) => (
                  <span
                    key={m}
                    title={moodLabel(m)}
                    className="h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: moodColor(m) }}
                  />
                ))}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            aria-label={entry.bookmarked ? "Remove bookmark" : "Bookmark this entry"}
            className={`shrink-0 rounded-full p-1 transition-colors ${
              entry.bookmarked ? "text-brand-600" : "text-ink/25 hover:text-ink/50 active:text-ink/50"
            }`}
          >
            <Star className="h-4 w-4" strokeWidth={2} fill={entry.bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        {entry.prompt && (
          <p className="mt-2 line-clamp-1 font-display text-sm italic text-brand-700">{entry.prompt.text}</p>
        )}
        <p className="mt-1 line-clamp-2 text-sm text-ink/80">{entry.content}</p>
      </div>
    </li>
  );
}
