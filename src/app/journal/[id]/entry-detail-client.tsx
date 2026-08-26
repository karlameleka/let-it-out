"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import {
  deleteEntry,
  getEntryDetail,
  toggleBookmark,
  type JournalEntryDetail,
} from "@/lib/local-journal";
import { moodLabel } from "@/lib/moods";
import { MoodDot } from "@/components/mood-dot";
import { Container } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function EntryDetailClient({
  userId,
  id,
  dict,
  locale,
}: {
  userId: string;
  id: string;
  dict: Dictionary["entryDetail"];
  locale: Locale;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntryDetail | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getEntryDetail(userId, id).then(setEntry);
  }, [userId, id]);

  async function handleToggleBookmark() {
    if (!entry) return;
    setEntry({ ...entry, bookmarked: !entry.bookmarked });
    const result = await toggleBookmark(userId, id);
    if (!result.success) setEntry((prev) => (prev ? { ...prev, bookmarked: !prev.bookmarked } : prev));
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteEntry(userId, id);
    if (result.success) {
      router.push("/journal");
    } else {
      setDeleting(false);
    }
  }

  if (entry === undefined) return null;

  if (entry === null) {
    return (
      <Container className="max-w-3xl py-16 text-center sm:py-20">
        <p className="text-ink/60">{dict.notFound}</p>
        <Link href="/journal" className="mt-3 inline-block text-sm font-medium text-brand-600 link-grow">
          &larr; {dict.backToEntries}
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        &larr; {dict.backToEntries}
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-brand-50 px-6 py-4 sm:px-8">
          <p className="text-sm font-medium text-brand-700">
            {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-3">
            {entry.moods.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {entry.moods.map((m) => (
                  <div key={m} className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-brand-700">{moodLabel(m, locale)}</span>
                    <MoodDot mood={m} size="md" locale={locale} />
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-label={entry.bookmarked ? dict.removeBookmark : dict.bookmarkThis}
              className={`rounded-full p-1.5 transition-colors ${
                entry.bookmarked ? "text-brand-600" : "text-ink/30 hover:text-ink/50 active:text-ink/50"
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

        <div className="border-t border-brand-100 px-6 py-3.5 sm:px-8">
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs text-ink/30 transition-colors hover:text-red-500 active:text-red-500"
            >
              {dict.deleteEntry}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-ink/50">{dict.deleteConfirm}</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="font-semibold text-red-600 transition-colors hover:text-red-700 active:text-red-700 disabled:opacity-50"
              >
                {deleting ? dict.deleting : dict.delete}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-ink/50 transition-colors hover:text-ink/70 active:text-ink/70 disabled:opacity-50"
              >
                {dict.cancel}
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
