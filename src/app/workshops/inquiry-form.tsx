"use client";

import { useActionState } from "react";
import { submitWorkshopInquiry } from "@/lib/workshop-actions";
import { Button } from "@/components/ui";
import type { WorkshopTopic } from "@/lib/content/workshops";
import type { Dictionary } from "@/lib/i18n/dictionary";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export default function WorkshopInquiryForm({
  topics,
  dict,
}: {
  topics: WorkshopTopic[];
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(submitWorkshopInquiry, undefined);
  const t = dict.workshopForm;
  const f = dict.forms;

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-brand-800">{t.receivedTitle}</h3>
        <p className="mt-2 text-sm text-ink/70">{t.receivedDescription}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="organizationName">{t.orgName}</label>
          <input id="organizationName" name="organizationName" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contactName">{t.yourName}</label>
          <input id="contactName" name="contactName" required className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">{f.email}</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">{f.phone}</label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="workshopTopic">{t.workshopTopic}</label>
        <select id="workshopTopic" name="workshopTopic" defaultValue={topics[0].title} className={inputClass}>
          {topics.map((topic) => (
            <option key={topic.slug} value={topic.title}>{topic.title}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="groupSize">{t.groupSize}</label>
          <input id="groupSize" name="groupSize" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="preferredDates">{t.preferredDates}</label>
          <input id="preferredDates" name="preferredDates" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="message">{t.tellUsMore}</label>
        <textarea id="message" name="message" rows={4} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? f.sending : t.submit}
      </Button>
    </form>
  );
}
