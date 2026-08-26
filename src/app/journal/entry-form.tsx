"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ImagePlus, PenLine, Shuffle, Sparkles, X } from "lucide-react";
import { shufflePrompt } from "@/lib/journal-actions";
import { createEntry, type EntryFormState } from "@/lib/local-journal";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui";
import MoodPicker from "@/components/mood-picker";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const PHOTO_PERMISSION_KEY = "lio_photo_access_granted";
const MODE_KEY = "lio_journal_mode";

type Prompt = { id: string; category: string; text: string } | null;
type Mode = "prompt" | "free";

export default function EntryForm({
  userId,
  initialPrompt,
  dict,
  moodPickerDict,
  locale = "en",
  onSaved,
}: {
  userId: string;
  initialPrompt: Prompt;
  dict: Dictionary["entryForm"];
  moodPickerDict: Dictionary["moodPicker"];
  locale?: Locale;
  /** Called once per successful save, in addition to the form's own
   * reset-for-next-entry behavior below — e.g. to navigate back to the
   * feed once the composer is done. */
  onSaved?: () => void;
}) {
  const CELEBRATIONS = useMemo(
    () => [dict.celebration1, dict.celebration2, dict.celebration3, dict.celebration4, dict.celebration5],
    [dict],
  );
  const [moods, setMoods] = useState<string[]>([]);
  const [key, setKey] = useState(0);
  const [prompt, setPrompt] = useState(initialPrompt);
  // Remembered across sessions so the composer opens the way the person
  // left it last time — defaults to "prompt" (the pre-existing behavior)
  // rather than "free" so nothing changes for people who never touch it.
  const [mode, setMode] = useState<Mode>("prompt");
  useEffect(() => {
    const saved = window.localStorage.getItem(MODE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "free" || saved === "prompt") setMode(saved);
  }, []);

  function changeMode(next: Mode) {
    setMode(next);
    window.localStorage.setItem(MODE_KEY, next);
  }

  async function saveLocally(_prevState: EntryFormState, formData: FormData): Promise<EntryFormState> {
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return { error: dict.writeSomethingError };
    try {
      await createEntry(userId, {
        content,
        moods: String(formData.get("moods") ?? "")
          .split(",")
          .filter(Boolean),
        photoUrl: (String(formData.get("photoUrl") ?? "") || null),
        prompt: mode === "prompt" && prompt ? { category: prompt.category, text: prompt.text } : null,
      });
      return { success: true };
    } catch {
      return { error: dict.saveError };
    }
  }

  const [state, formAction, pending] = useActionState(saveLocally, undefined);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [celebration] = useState(() => CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]);
  const [shuffling, startShuffle] = useTransition();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPhotoPermission, setShowPhotoPermission] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setMoods([]);
      setPhoto(null);
      setPhotoError(null);
      onSaved?.();
    }
  }

  function requestPhotoAccess() {
    if (window.localStorage.getItem(PHOTO_PERMISSION_KEY) === "1") {
      fileInputRef.current?.click();
    } else {
      setShowPhotoPermission(true);
    }
  }

  function allowPhotoAccess() {
    window.localStorage.setItem(PHOTO_PERMISSION_KEY, "1");
    setShowPhotoPermission(false);
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError(dict.chooseImageError);
      return;
    }
    setPhotoError(null);
    setPhotoProcessing(true);
    try {
      setPhoto(await compressImage(file));
    } catch {
      setPhotoError(dict.photoProcessError);
    } finally {
      setPhotoProcessing(false);
    }
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
      <div
        role="tablist"
        aria-label={dict.writingModeLabel}
        className="inline-flex rounded-full border border-brand-200 bg-white p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "prompt"}
          onClick={() => changeMode("prompt")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            mode === "prompt" ? "bg-brand-600 text-white" : "text-ink/60 hover:text-brand-600 active:text-brand-600"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.givePrompt}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "free"}
          onClick={() => changeMode("free")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            mode === "free" ? "bg-brand-600 text-white" : "text-ink/60 hover:text-brand-600 active:text-brand-600"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
          {dict.freeFlow}
        </button>
      </div>

      {mode === "prompt" && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              {prompt?.category ?? dict.reflection}
            </p>
            <button
              type="button"
              onClick={handleShuffle}
              disabled={shuffling}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50"
            >
              <Shuffle className={`h-3.5 w-3.5 ${shuffling ? "animate-spin" : ""}`} strokeWidth={2} />
              {shuffling ? dict.shuffling : dict.shufflePrompt}
            </button>
          </div>
          <p
            data-testid="journal-prompt-text"
            className={`mt-2 font-display text-xl font-medium italic text-brand-900 transition-opacity ${shuffling ? "opacity-40" : "opacity-100"}`}
          >
            {prompt?.text ?? dict.defaultPromptText}
          </p>
        </div>
      )}

      <form action={formAction} key={key} className="space-y-4">
        <input type="hidden" name="moods" value={moods.join(",")} />

        <div className="overflow-hidden rounded-xl border border-brand-200 bg-white focus-within:border-brand-500">
          <div className="border-b border-brand-100 bg-brand-50/50 p-4">
            <MoodPicker
              moods={moods}
              onChange={setMoods}
              label={moodPickerDict.label}
              hint={moodPickerDict.hint}
              locale={locale}
            />
          </div>

          <textarea
            name="content"
            rows={6}
            required
            placeholder={mode === "prompt" ? dict.promptPlaceholder : dict.freePlaceholder}
            className="w-full border-0 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.addPhotoLabel}</p>
          {photo ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer */}
              <img src={photo} alt="" className="h-28 w-28 rounded-xl border border-brand-200 object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                aria-label={dict.removePhoto}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink/60 shadow-md hover:text-ink active:text-ink"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={requestPhotoAccess}
              disabled={photoProcessing}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-200 px-4 py-3 text-sm text-ink/60 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" strokeWidth={2} />
              {photoProcessing ? dict.processing : dict.addPhotoButton}
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
          {pending ? dict.saving : dict.saveEntry}
        </Button>
      </form>

      {showPhotoPermission && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xs animate-pop-in overflow-hidden rounded-2xl bg-white text-center shadow-2xl">
            <div className="px-5 pt-6">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-ink/90">{dict.photoPermissionTitle}</p>
              <p className="mt-1.5 pb-5 text-sm text-ink/60">{dict.photoPermissionBody}</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-brand-100 border-t border-brand-100 text-sm font-medium">
              <button
                type="button"
                onClick={() => setShowPhotoPermission(false)}
                className="py-3 text-ink/60 transition-colors hover:bg-brand-50 active:bg-brand-50"
              >
                {dict.dontAllow}
              </button>
              <button
                type="button"
                onClick={allowPhotoAccess}
                className="py-3 text-brand-600 transition-colors hover:bg-brand-50 active:bg-brand-50"
              >
                {dict.allowAccess}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
