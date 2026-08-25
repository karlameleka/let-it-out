"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { addAvailabilityWindow, deleteAvailabilityWindow } from "@/lib/therapist-availability-actions";
import { Button } from "@/components/ui";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export type AvailabilityWindow = { id: string; dayOfWeek: number; startTime: string; endTime: string };

export default function AvailabilityManager({ windows }: { windows: AvailabilityWindow[] }) {
  const [state, formAction, pending] = useActionState(addAvailabilityWindow, undefined);

  const sorted = [...windows].sort((a, b) =>
    a.dayOfWeek === b.dayOfWeek ? a.startTime.localeCompare(b.startTime) : a.dayOfWeek - b.dayOfWeek,
  );

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <h2 className="font-display font-semibold text-brand-900">Weekly availability</h2>
      <p className="mt-1 text-sm text-ink/60">
        Open up recurring windows and clients will see real 50-minute slots to pick from on your booking page,
        instead of just requesting a date and time.
      </p>

      {sorted.length > 0 && (
        <div className="mt-4 space-y-2">
          {sorted.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-2.5 text-sm"
            >
              <span className="font-medium text-ink/80">
                {DAY_LABELS[w.dayOfWeek]} · {w.startTime}–{w.endTime}
              </span>
              <form action={deleteAvailabilityWindow}>
                <input type="hidden" name="id" value={w.id} />
                <button
                  type="submit"
                  aria-label="Remove"
                  title="Remove"
                  className="rounded-lg p-1 text-ink/40 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="dayOfWeek" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            Day
          </label>
          <select id="dayOfWeek" name="dayOfWeek" defaultValue="1" className={inputClass}>
            {DAY_LABELS.map((label, i) => (
              <option key={label} value={i}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startTime" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            From
          </label>
          <input id="startTime" name="startTime" type="time" required defaultValue="09:00" className={inputClass} />
        </div>
        <div>
          <label htmlFor="endTime" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            To
          </label>
          <input id="endTime" name="endTime" type="time" required defaultValue="17:00" className={inputClass} />
        </div>
        <Button type="submit" disabled={pending} variant="outline" className="!px-4 !py-2 text-sm">
          {pending ? "Adding…" : "Add window"}
        </Button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
