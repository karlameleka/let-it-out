"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/lib/contact-actions";
import { Button } from "@/components/ui";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-brand-800">
          Message sent
        </h3>
        <p className="mt-2 text-sm text-ink/70">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" />
        <Field label="Email" name="email" type="email" />
      </div>
      <Field label="Subject" name="subject" />
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink/80">
          Message
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
        {pending ? "Sending…" : "Send message"}
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
