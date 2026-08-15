"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createJournalEntry, shufflePrompt } from "@/lib/journal-actions";
import {
  AmbientGlow,
  Button,
  FormError,
  Surface,
  Textarea,
  focusRing,
  motionEase,
} from "@/components/ui";

const MOODS = [
  { emoji: "😊", label: "Great" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Low" },
  { emoji: "😣", label: "Stressed" },
  { emoji: "😴", label: "Tired" },
];

const CELEBRATIONS = [
  "Entry saved! 🎉 That's one more step in your journey.",
  "Nice work — that's out of your head and onto the page. ✨",
  "Saved! Come back tomorrow to keep the streak going. 🔥",
  "Entry saved. Future you will thank present you for this. 💛",
  "That's in the books! See you tomorrow? 📖",
];

type Prompt = { id: string; category: string; text: string } | null;

export default function EntryForm({ initialPrompt }: { initialPrompt: Prompt }) {
  const [state, formAction, pending] = useActionState(createJournalEntry, undefined);
  const [mood, setMood] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [celebration] = useState(() => CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]);
  const [shuffling, startShuffle] = useTransition();

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setMood(null);
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
    <div className="space-y-8">
      <Surface tone="tinted" className="relative overflow-hidden p-7 sm:p-8">
        <AmbientGlow palette="brand" intensity={0.16} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
              {prompt?.category ?? "Reflection"}
            </p>
            <button
              type="button"
              onClick={handleShuffle}
              disabled={shuffling}
              className={`shrink-0 rounded-full border border-brand-900/10 bg-white/80 px-4 py-1.5 text-xs font-medium text-brand-600 shadow-ambient-sm backdrop-blur-md ${motionEase} ${focusRing} hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-ambient active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50`}
            >
              {shuffling ? "Shuffling…" : "🔀 Shuffle prompt"}
            </button>
          </div>
          {/* The prompt itself is the focal point of the page — display face,
              generous leading, and a gentle dip while the next one loads. */}
          <p
            data-testid="journal-prompt-text"
            className={`mt-4 font-display text-xl font-medium italic leading-relaxed tracking-tight text-brand-900 sm:text-2xl ${motionEase} ${
              shuffling ? "opacity-40 blur-[1px]" : "opacity-100 blur-0"
            }`}
          >
            {prompt?.text ?? "What's on your mind today?"}
          </p>
        </div>
      </Surface>

      <form action={formAction} key={key} className="space-y-6">
        {prompt?.id && <input type="hidden" name="promptId" value={prompt.id} />}
        <input type="hidden" name="mood" value={mood ?? ""} />

        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
            How are you feeling?
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {MOODS.map(({ emoji, label }) => {
              const selected = mood === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => setMood(selected ? null : emoji)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl ${motionEase} ${focusRing} hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-[0.98] ${
                    selected
                      ? "scale-105 border-brand-400 bg-white shadow-ambient"
                      : "border-brand-900/10 bg-white/60 shadow-ambient-sm backdrop-blur-md hover:border-brand-300"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="entry-content"
            className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-ink-faint"
          >
            Your entry
          </label>
          <Textarea
            id="entry-content"
            name="content"
            rows={8}
            required
            placeholder="Let it out here..."
            className="text-base"
          />
        </div>

        {state?.error && <FormError>{state.error}</FormError>}
        {state?.success && (
          <p
            data-testid="entry-saved-message"
            className="animate-pop-in rounded-2xl border border-brand-900/10 bg-brand-50/70 px-4 py-3 text-sm font-medium text-brand-700 backdrop-blur-sm"
          >
            {celebration}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save entry"}
        </Button>
      </form>
    </div>
  );
}
