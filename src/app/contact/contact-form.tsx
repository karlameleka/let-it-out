"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/lib/contact-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ContactForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(submitContactMessage, undefined);
  const t = dict.contact;
  const f = dict.forms;

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-brand-800">{t.sentTitle}</h3>
        <p className="mt-2 text-sm text-ink/70">{t.sentDescription}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.yourName} name="name" />
        <Field label={f.email} name="email" type="email" />
      </div>
      <Field label={f.subject} name="subject" />
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink/80">
          {f.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? f.sending : f.send}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}
