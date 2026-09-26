"use client";

import { useActionState, useState } from "react";
import { addMedication } from "@/lib/therapist-actions";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

export default function MedicationForm({ clientEmail, clientName }: { clientEmail: string; clientName: string }) {
  const [state, formAction, pending] = useActionState(addMedication, undefined);
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="medName" className={labelClass}>Medication name</label>
          <input id="medName" name="name" required placeholder="e.g. Sertraline" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="medDosage" className={labelClass}>Dosage</label>
          <input id="medDosage" name="dosage" placeholder="e.g. 50mg, once daily" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="medInstructions" className={labelClass}>Instructions (optional)</label>
        <textarea
          id="medInstructions"
          name="instructions"
          rows={2}
          placeholder="Anything the client should know, e.g. take with food"
          className={fieldClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add medication"}
      </Button>
    </form>
  );
}
