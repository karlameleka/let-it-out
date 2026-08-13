"use client";

import { useActionState, useState } from "react";
import { createJournalEntry } from "@/lib/journal-actions";
import { Button } from "@/components/ui";

const MOODS = ["😊", "😌", "😐", "😔", "😣", "😴"];

export default function EntryForm({ promptId }: { promptId?: string }) {
  const [state, formAction, pending] = useActionState(createJournalEntry, undefined);
  const [mood, setMood] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setMood(null);
    }
  }

  return (
    <form action={formAction} key={key} className="space-y-4">
      {promptId && <input type="hidden" name="promptId" value={promptId} />}
      <input type="hidden" name="mood" value={mood ?? ""} />

      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m === mood ? null : m)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors ${
              mood === m ? "border-brand-600 bg-brand-50" : "border-brand-100 hover:border-brand-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        name="content"
        rows={6}
        required
        placeholder="Let it out here..."
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-brand-600">Entry saved.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save entry"}
      </Button>
    </form>
  );
}
