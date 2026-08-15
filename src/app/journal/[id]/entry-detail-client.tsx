"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getJournalEntryDetail, toggleBookmark, type JournalEntryDetail } from "@/lib/journal-actions";
import { moodLabel } from "@/lib/moods";
import { MoodDot } from "@/components/mood-dot";
import { Container } from "@/components/ui";

export default function EntryDetailClient({ id }: { id: string }) {
  const [entry, setEntry] = useState<JournalEntryDetail | null | undefined>(undefined);

  useEffect(() => {
    getJournalEntryDetail(id).then(setEntry);
  }, [id]);

  async function handleToggleBookmark() {
    if (!entry) return;
    setEntry({ ...entry, bookmarked: !entry.bookmarked });
    const result = await toggleBookmark(id);
    if (!result.success) setEntry((prev) => (prev ? { ...prev, bookmarked: !prev.bookmarked } : prev));
  }

  if (entry === undefined) return null;

  if (entry === null) {
    return (
      <Container className="max-w-3xl py-16 text-center sm:py-20">
        <p className="text-ink/60">That entry doesn&apos;t exist, or isn&apos;t yours to see.</p>
        <Link href="/journal" className="mt-3 inline-block text-sm font-medium text-brand-600 link-grow">
          &larr; Back to entries
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        &larr; Back to entries
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-brand-50 px-6 py-4 sm:px-8">
          <p className="text-sm font-medium text-brand-700">
            {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-3">
            {entry.mood && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-brand-700">{moodLabel(entry.mood)}</span>
                <MoodDot mood={entry.mood} size="md" />
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-label={entry.bookmarked ? "Remove bookmark" : "Bookmark this entry"}
              className={`rounded-full p-1.5 transition-colors ${
                entry.bookmarked ? "text-brand-600" : "text-ink/30 hover:text-ink/50"
              }`}
            >
              <Star className="h-5 w-5" strokeWidth={2} fill={entry.bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {entry.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer
            <img
              src={entry.photoUrl}
              alt=""
              className="mb-6 max-h-96 w-full rounded-2xl border border-brand-100 object-cover"
            />
          )}

          {entry.prompt && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {entry.prompt.category}
              </p>
              <p className="mt-1 font-display font-medium italic text-brand-900">{entry.prompt.text}</p>
            </div>
          )}

          <p className="mt-6 whitespace-pre-line font-display text-lg leading-relaxed text-ink/80">
            {entry.content}
          </p>
        </div>
      </div>
    </Container>
  );
}
