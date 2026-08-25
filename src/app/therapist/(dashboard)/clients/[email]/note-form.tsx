"use client";

import { useActionState, useState } from "react";
import { addClientNote } from "@/lib/therapist-actions";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ClientNoteForm({ clientEmail, clientName }: { clientEmail: string; clientName: string }) {
  const [state, formAction, pending] = useActionState(addClientNote, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) setKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={key} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5">
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <input type="hidden" name="clientName" value={clientName} />

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="sessionDate" className={labelClass}>Session date</label>
          <input id="sessionDate" name="sessionDate" type="date" defaultValue={todayISO()} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Session notes</label>
        <textarea id="notes" name="notes" required rows={4} placeholder="What came up in this session?" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="nextSteps" className={labelClass}>Next steps</label>
        <textarea
          id="nextSteps"
          name="nextSteps"
          rows={2}
          placeholder="What should happen before the next session?"
          className={fieldClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
