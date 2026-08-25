"use client";

import { useActionState, useState } from "react";
import { sendReferral } from "@/lib/therapist-actions";
import { Button } from "@/components/ui";
import type { TherapistClientNote } from "@/lib/therapist-data";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

type Colleague = { id: string; name: string; credentials: string };

function ReferralFormBody({
  clientEmail,
  clientName,
  clientPhone,
  hasIntake,
  notes,
  colleagues,
  onClose,
}: {
  clientEmail: string;
  clientName: string;
  clientPhone: string | null;
  hasIntake: boolean;
  notes: TherapistClientNote[];
  colleagues: Colleague[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(sendReferral, undefined);

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-brand-900">Refer {clientName}</p>
        <button type="button" onClick={onClose} className="text-xs font-medium text-ink/40 hover:text-ink/70">
          {state?.success ? "Close" : "Cancel"}
        </button>
      </div>
      {state?.success ? (
        <p className="mt-3 text-sm text-brand-700">Referral sent.</p>
      ) : (
        <form action={formAction} className="mt-3 space-y-4">
          <input type="hidden" name="clientEmail" value={clientEmail} />
          <input type="hidden" name="clientName" value={clientName} />
          <input type="hidden" name="clientPhone" value={clientPhone ?? ""} />

          <div>
            <label htmlFor="toCounselorId" className={labelClass}>Refer to</label>
            <select id="toCounselorId" name="toCounselorId" required className={fieldClass}>
              <option value="">Choose a colleague…</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.credentials ? ` — ${c.credentials}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className={labelClass}>Reason for referral</label>
            <textarea id="reason" name="reason" required rows={3} className={fieldClass} placeholder="Why are you sharing or handing off this client?" />
          </div>

          <div>
            <p className={labelClass}>Type</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="radio" name="type" value="COLLABORATE" defaultChecked required />
                Collaborate — I&rsquo;m keeping this client, just looping them in
              </label>
            </div>
            <div className="mt-1.5 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="radio" name="type" value="FULL_REFERRAL" required />
                Full referral — I&rsquo;m handing this client off
              </label>
            </div>
          </div>

          <div>
            <p className={labelClass}>What to send along</p>
            {hasIntake && (
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" name="includeIntake" />
                Their intake form (latest submission + AI summary)
              </label>
            )}
            {notes.length === 0 ? (
              <p className="mt-1 text-sm text-ink/50">No session notes yet to share.</p>
            ) : (
              <div className="mt-1.5 max-h-48 space-y-1.5 overflow-y-auto">
                {notes.map((n) => (
                  <label key={n.id} className="flex items-start gap-2 text-sm text-ink/80">
                    <input type="checkbox" name="noteIds" value={n.id} className="mt-0.5" />
                    <span>
                      {n.sessionDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {" — "}
                      <span className="text-ink/50">{n.notes.slice(0, 60)}{n.notes.length > 60 ? "…" : ""}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="!px-5 !py-2.5 text-sm">
            {pending ? "Sending…" : "Send referral"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ReferClientForm({
  clientEmail,
  clientName,
  clientPhone,
  hasIntake,
  notes,
  colleagues,
}: {
  clientEmail: string;
  clientName: string;
  clientPhone: string | null;
  hasIntake: boolean;
  notes: TherapistClientNote[];
  colleagues: Colleague[];
}) {
  const [open, setOpen] = useState(false);
  // Bumped every time the form is closed, so reopening always mounts a fresh
  // ReferralFormBody (and thus a fresh useActionState) instead of showing a
  // stale "Referral sent." from a previous submission.
  const [instance, setInstance] = useState(0);

  if (colleagues.length === 0) {
    return (
      <p
        title="Once a colleague sets up their own portal login, they'll appear here as someone you can refer clients to."
        className="max-w-[240px] rounded-full border border-dashed border-brand-200 px-4 py-2 text-right text-xs text-ink/40"
      >
        No colleagues with portal access yet to refer to
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
      >
        Refer this client →
      </button>
    );
  }

  return (
    <ReferralFormBody
      key={instance}
      clientEmail={clientEmail}
      clientName={clientName}
      clientPhone={clientPhone}
      hasIntake={hasIntake}
      notes={notes}
      colleagues={colleagues}
      onClose={() => {
        setOpen(false);
        setInstance((i) => i + 1);
      }}
    />
  );
}
