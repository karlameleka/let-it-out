"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { updateClientNote, deleteClientNote } from "@/lib/therapist-actions";
import type { TherapistClientNote } from "@/lib/therapist-data";
import { moodColor, moodLabel } from "@/lib/moods";
import { Button } from "@/components/ui";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import MoodPicker from "@/components/mood-picker";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Mounted only while editing — a fresh instance each time, so its
 * useActionState result starts clean and "just saved successfully" can't
 * leak into the next time this note is opened for editing. */
function EditNoteForm({ note, onDone }: { note: TherapistClientNote; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updateClientNote, undefined);
  const [moods, setMoods] = useState<string[]>(note.moods);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand-300 bg-white p-5">
      <input type="hidden" name="noteId" value={note.id} />
      <input type="hidden" name="clientEmail" value={note.clientEmail} />
      <input type="hidden" name="moods" value={moods.join(",")} />
      <input
        type="date"
        name="sessionDate"
        defaultValue={toDateInputValue(note.sessionDate)}
        className={fieldClass + " w-44"}
      />
      <MoodPicker moods={moods} onChange={setMoods} label="How was the client feeling?" />
      <textarea name="notes" defaultValue={note.notes} required rows={4} className={fieldClass} />
      <textarea
        name="nextSteps"
        defaultValue={note.nextSteps ?? ""}
        rows={2}
        placeholder="Next steps"
        className={fieldClass}
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending} className="!px-4 !py-2 text-xs">
          {pending ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-brand-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ClientNoteItem({
  note,
  sessionNumber,
}: {
  note: TherapistClientNote;
  sessionNumber: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditNoteForm note={note} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold text-brand-900">Session {sessionNumber}</p>
          <p className="text-xs text-ink/40">
            {note.sessionDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit note"
            className="rounded-lg p-1.5 text-ink/40 hover:bg-brand-50 hover:text-brand-700"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <form action={deleteClientNote}>
            <input type="hidden" name="noteId" value={note.id} />
            <input type="hidden" name="clientEmail" value={note.clientEmail} />
            <ConfirmSubmitButton
              confirmMessage="Delete this session's page? This can't be undone."
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      {note.moods.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.moods.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-ink/70"
            >
              <span className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: moodColor(m) }} />
              {moodLabel(m)}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 whitespace-pre-line text-sm text-ink/80">{note.notes}</p>
      {note.nextSteps && (
        <div className="mt-3 rounded-xl bg-brand-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Next steps</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{note.nextSteps}</p>
        </div>
      )}
    </div>
  );
}
