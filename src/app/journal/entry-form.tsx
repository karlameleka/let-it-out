"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createJournalEntry, shufflePrompt } from "@/lib/journal-actions";
import { Button } from "@/components/ui";

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
            className="shrink-0 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-600 transition-transform hover:scale-105 hover:border-brand-400 disabled:opacity-50"
          >
            {shuffling ? "Shuffling…" : "🔀 Shuffle prompt"}
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
            {MOODS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                title={label}
                onClick={() => setMood(emoji === mood ? null : emoji)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-all hover:scale-110 ${
                  mood === emoji
                    ? "border-brand-600 bg-brand-50 scale-110 shadow-[0_2px_0_0_theme(colors.brand.300)]"
                    : "border-brand-100 hover:border-brand-300"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <textarea
          name="content"
          rows={6}
          required
          placeholder="Let it out here..."
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && (
          <p data-testid="entry-saved-message" className="animate-pop-in text-sm font-medium text-brand-600">
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
