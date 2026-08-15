"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Shuffle, X } from "lucide-react";
import { createJournalEntry, shufflePrompt } from "@/lib/journal-actions";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui";
import { CORE_EMOTIONS, getSecondaryEmotions, type CoreEmotionId } from "@/lib/moods";

const CELEBRATIONS = [
  "Entry saved — that's one more step in your journey.",
  "Nice work. That's out of your head and onto the page.",
  "Saved. Come back tomorrow to keep the streak going.",
  "Entry saved. Future you will thank present you for this.",
  "That's in the books. See you tomorrow?",
];

type Prompt = { id: string; category: string; text: string } | null;

export default function EntryForm({
  initialPrompt,
  onSaved,
}: {
  initialPrompt: Prompt;
  /** Called once per successful save, in addition to the form's own
   * reset-for-next-entry behavior below — e.g. to navigate back to the
   * feed once the composer is done. */
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(createJournalEntry, undefined);
  const [mood, setMood] = useState<string | null>(null);
  const [expandedCore, setExpandedCore] = useState<CoreEmotionId | null>(null);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [celebration] = useState(() => CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]);
  const [shuffling, startShuffle] = useTransition();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setMood(null);
      setExpandedCore(null);
      setPhoto(null);
      setPhotoError(null);
      onSaved?.();
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    setPhotoError(null);
    setPhotoProcessing(true);
    try {
      setPhoto(await compressImage(file));
    } catch {
      setPhotoError("Couldn't process that photo — try a different one.");
    } finally {
      setPhotoProcessing(false);
    }
  }

  function selectCore(coreId: CoreEmotionId) {
    if (mood === coreId && expandedCore === coreId) {
      setMood(null);
      setExpandedCore(null);
    } else {
      setMood(coreId);
      setExpandedCore(coreId);
    }
  }

  function selectSecondary(id: string) {
    setMood(mood === id ? null : id);
  }

  function handleShuffle() {
    startShuffle(async () => {
      const next = await shufflePrompt(prompt?.id);
      if (next) setPrompt(next);
    });
  }

  // A new prompt for next time is fetched only after each successful save
  // (key increments then, and only then) — not on the initial mount.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {prompt?.category ?? "Reflection"}
          </p>
          <button
            type="button"
            onClick={handleShuffle}
            disabled={shuffling}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            <Shuffle className={`h-3.5 w-3.5 ${shuffling ? "animate-spin" : ""}`} strokeWidth={2} />
            {shuffling ? "Shuffling…" : "Shuffle prompt"}
          </button>
        </div>
        <p
          data-testid="journal-prompt-text"
          className={`mt-2 font-display text-xl font-medium italic text-brand-900 transition-opacity ${shuffling ? "opacity-40" : "opacity-100"}`}
        >
          {prompt?.text ?? "What's on your mind today?"}
        </p>
      </div>

      <form action={formAction} key={key} className="space-y-4">
        {prompt?.id && <input type="hidden" name="promptId" value={prompt.id} />}
        <input type="hidden" name="mood" value={mood ?? ""} />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
            How are you feeling?
          </p>
          <div className="flex flex-wrap gap-2">
            {CORE_EMOTIONS.map((core) => {
              const isExactMatch = mood === core.id;
              const isExpanded = expandedCore === core.id;
              return (
                <button
                  key={core.id}
                  type="button"
                  onClick={() => selectCore(core.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                    isExactMatch
                      ? "border-brand-600 bg-brand-50 text-brand-800 shadow-[0_2px_0_0_theme(colors.brand.300)]"
                      : isExpanded
                        ? "border-brand-300 text-ink/80"
                        : "border-brand-100 text-ink/70 hover:border-brand-300"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: core.color }}
                  />
                  {core.label}
                </button>
              );
            })}
          </div>

          {expandedCore && (
            <div className="animate-pop-in mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-brand-100 bg-brand-50/50 p-3">
              {getSecondaryEmotions(expandedCore).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectSecondary(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    mood === m.id
                      ? "border-brand-600 bg-white text-brand-800 shadow-sm"
                      : "border-brand-100 bg-white/60 text-ink/60 hover:border-brand-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          name="content"
          rows={6}
          required
          placeholder="Let it out here..."
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Add a photo (optional)</p>
          {photo ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer */}
              <img src={photo} alt="" className="h-28 w-28 rounded-xl border border-brand-200 object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                aria-label="Remove photo"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink/60 shadow-md hover:text-ink"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoProcessing}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-200 px-4 py-3 text-sm text-ink/60 transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" strokeWidth={2} />
              {photoProcessing ? "Processing…" : "Add photo"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photoError && <p className="mt-1.5 text-xs text-red-600">{photoError}</p>}
          <input type="hidden" name="photoUrl" value={photo ?? ""} />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && (
          <p data-testid="entry-saved-message" className="animate-pop-in text-sm font-medium text-brand-600">
            {celebration}
          </p>
        )}

        <Button type="submit" disabled={pending || photoProcessing}>
          {pending ? "Saving…" : "Save entry"}
        </Button>
      </form>
    </div>
  );
}
