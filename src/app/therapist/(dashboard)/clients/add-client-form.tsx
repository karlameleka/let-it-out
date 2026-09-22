"use client";

import { useActionState, useState } from "react";
import { addManualClient } from "@/lib/therapist-actions";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40";

export default function AddClientForm() {
  const [state, formAction, pending] = useActionState(addManualClient, undefined);
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

  return (
    <details className="rounded-2xl border border-brand-100 bg-white" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <span className="font-display text-sm font-semibold text-brand-900">Add a client</span>
        <span className="text-xs font-medium text-brand-600">{open ? "Close" : "New"}</span>
      </summary>
      <div className="border-t border-brand-50 p-4 pt-3">
        <p className="mb-3 text-xs text-ink/50">
          For someone referred to you who hasn&rsquo;t booked yet. Already have a client with this email? This just
          updates their record.
        </p>
        <form action={formAction} key={key} className="space-y-3">
          <div>
            <label htmlFor="manual-client-name" className={labelClass}>Name</label>
            <input id="manual-client-name" name="name" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="manual-client-email" className={labelClass}>Email</label>
            <input id="manual-client-email" name="clientEmail" type="email" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="manual-client-phone" className={labelClass}>Phone (optional)</label>
            <input id="manual-client-phone" name="phone" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="manual-client-referral" className={labelClass}>Referral source (optional)</label>
            <textarea
              id="manual-client-referral"
              name="referralSource"
              rows={2}
              placeholder="e.g. Referred by Dr. Samir, or a friend's recommendation"
              className={fieldClass}
            />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="!px-4 !py-2 text-xs">
            {pending ? "Adding…" : "Add client"}
          </Button>
        </form>
      </div>
    </details>
  );
}
