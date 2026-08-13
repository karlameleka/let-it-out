"use client";

import { useActionState } from "react";
import { submitWorkshopInquiry } from "@/lib/workshop-actions";
import { Button } from "@/components/ui";
import { WORKSHOP_TOPICS } from "@/lib/content/workshops";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export default function WorkshopInquiryForm() {
  const [state, formAction, pending] = useActionState(submitWorkshopInquiry, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-brand-800">
          Request received
        </h3>
        <p className="mt-2 text-sm text-ink/70">
          Thank you for reaching out — our team will follow up to discuss
          your workshop.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="organizationName">Organization / community name</label>
          <input id="organizationName" name="organizationName" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contactName">Your name</label>
          <input id="contactName" name="contactName" required className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="workshopTopic">Workshop topic</label>
        <select id="workshopTopic" name="workshopTopic" defaultValue={WORKSHOP_TOPICS[0].title} className={inputClass}>
          {WORKSHOP_TOPICS.map((t) => (
            <option key={t.slug} value={t.title}>{t.title}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="groupSize">Approximate group size (optional)</label>
          <input id="groupSize" name="groupSize" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="preferredDates">Preferred dates (optional)</label>
          <input id="preferredDates" name="preferredDates" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="message">Tell us more (optional)</label>
        <textarea id="message" name="message" rows={4} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Request a quote"}
      </Button>
    </form>
  );
}
