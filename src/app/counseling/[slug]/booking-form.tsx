"use client";

import { useActionState } from "react";
import { submitBookingRequest } from "@/lib/booking-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export default function BookingForm({ counselorId, dict }: { counselorId: string; dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, undefined);
  const t = dict.bookingForm;
  const f = dict.forms;

  const SESSION_TYPES = [
    { value: "INDIVIDUAL_COUNSELING", label: t.typeIndividual },
    { value: "COUPLES_COUNSELING", label: t.typeCouples },
    { value: "FOLLOW_UP", label: t.typeFollowUp },
    { value: "OTHER", label: t.typeOther },
  ];

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">{t.receivedTitle}</p>
        <p className="mt-2 text-sm text-ink/70">{t.receivedDescription}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="counselorId" value={counselorId} />
      <div>
        <label className={labelClass} htmlFor="name">{f.name}</label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">{f.email}</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">{f.phone}</label>
        <input id="phone" name="phone" type="tel" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="sessionType">{t.sessionType}</label>
        <select id="sessionType" name="sessionType" defaultValue="INDIVIDUAL_COUNSELING" className={inputClass}>
          {SESSION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="preferredDate">{t.preferredDate}</label>
          <input id="preferredDate" name="preferredDate" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="preferredTime">{t.preferredTime}</label>
          <input id="preferredTime" name="preferredTime" type="time" required className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-ink/45">{t.dateTimeHint}</p>
      <div>
        <label className={labelClass} htmlFor="message">{t.messageLabel}</label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? f.sending : t.submit}
      </Button>
    </form>
  );
}
