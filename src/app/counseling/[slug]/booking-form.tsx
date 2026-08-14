"use client";

import { useActionState } from "react";
import { submitBookingRequest } from "@/lib/booking-actions";
import { Button } from "@/components/ui";

const SESSION_TYPES = [
  { value: "INDIVIDUAL_COUNSELING", label: "Individual counseling" },
  { value: "COUPLES_COUNSELING", label: "Couples counseling" },
  { value: "FOLLOW_UP", label: "Follow-up session" },
  { value: "OTHER", label: "Other / not sure yet" },
];

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export default function BookingForm({ counselorId }: { counselorId: string }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">Request received</p>
        <p className="mt-2 text-sm text-ink/70">
          Thank you — we will reach out to confirm your appointment as soon
          as possible, by email or phone.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="counselorId" value={counselorId} />
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="sessionType">Session type</label>
        <select id="sessionType" name="sessionType" defaultValue="INDIVIDUAL_COUNSELING" className={inputClass}>
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="preferredDate">Preferred date</label>
          <input id="preferredDate" name="preferredDate" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="preferredTime">Preferred time</label>
          <input id="preferredTime" name="preferredTime" type="time" required className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-ink/45">
        Your preferred date and time aren&apos;t guaranteed — we&apos;ll
        confirm actual availability with you directly.
      </p>
      <div>
        <label className={labelClass} htmlFor="message">Anything you&apos;d like us to know? (optional)</label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Request session"}
      </Button>
    </form>
  );
}
