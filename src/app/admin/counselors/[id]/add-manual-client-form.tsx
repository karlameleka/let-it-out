"use client";

import { useActionState, useState } from "react";
import { addManualClientAdmin } from "@/lib/admin-actions";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40";

export default function AddManualClientForm({ counselorId }: { counselorId: string }) {
  const [state, formAction, pending] = useActionState(addManualClientAdmin, undefined);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        + Add a client
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-brand-900">Add a client</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-medium text-ink/50 hover:text-ink/70">
          Close
        </button>
      </div>
      <p className="mt-1 text-xs text-ink/50">
        For someone referred to this counselor who hasn&rsquo;t booked yet. Already a client here? This just updates
        their record.
      </p>
      <form action={formAction} key={key} className="mt-3 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="counselorId" value={counselorId} />
        <div>
          <label htmlFor="admin-manual-client-name" className={labelClass}>Name</label>
          <input id="admin-manual-client-name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="admin-manual-client-email" className={labelClass}>Email</label>
          <input id="admin-manual-client-email" name="clientEmail" type="email" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="admin-manual-client-phone" className={labelClass}>Phone (optional)</label>
          <input id="admin-manual-client-phone" name="phone" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="admin-manual-client-referral" className={labelClass}>Referral source (optional)</label>
          <input id="admin-manual-client-referral" name="referralSource" className={fieldClass} placeholder="e.g. Phone inquiry, walk-in" />
        </div>
        {state?.error && <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending} className="!px-4 !py-2 text-xs">
            {pending ? "Adding…" : "Add client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
