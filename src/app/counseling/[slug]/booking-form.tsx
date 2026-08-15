"use client";

import { useActionState } from "react";
import { submitBookingRequest } from "@/lib/booking-actions";
import {
  Button,
  Field,
  FormError,
  Input,
  Select,
  Surface,
  Textarea,
} from "@/components/ui";
import { CalendarMark } from "@/components/illustrations";

const SESSION_TYPES = [
  { value: "INDIVIDUAL_COUNSELING", label: "Individual counseling" },
  { value: "COUPLES_COUNSELING", label: "Couples counseling" },
  { value: "FOLLOW_UP", label: "Follow-up session" },
  { value: "OTHER", label: "Other / not sure yet" },
];

export default function BookingForm({ counselorId }: { counselorId: string }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, undefined);

  if (state?.success) {
    return (
      <Surface tone="tinted" className="animate-pop-in p-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-900/10 bg-white/80 text-brand-500 shadow-ambient-sm">
          <CalendarMark className="h-7 w-7" />
        </div>
        <p className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-900">
          Request received
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Thank you — we will reach out to confirm your appointment as soon
          as possible, by email or phone.
        </p>
      </Surface>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="counselorId" value={counselorId} />

      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required autoComplete="name" />
      </Field>

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
      </Field>

      <Field label="Session type" htmlFor="sessionType">
        <Select id="sessionType" name="sessionType" defaultValue="INDIVIDUAL_COUNSELING">
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preferred date" htmlFor="preferredDate">
          <Input id="preferredDate" name="preferredDate" type="date" required />
        </Field>
        <Field label="Preferred time" htmlFor="preferredTime">
          <Input id="preferredTime" name="preferredTime" type="time" required />
        </Field>
      </div>

      <p className="text-xs leading-relaxed text-ink-faint">
        Your preferred date and time aren&apos;t guaranteed — we&apos;ll
        confirm actual availability with you directly.
      </p>

      <Field
        label="Anything you'd like us to know? (optional)"
        htmlFor="message"
      >
        <Textarea id="message" name="message" rows={4} />
      </Field>

      {state?.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Request session"}
      </Button>
    </form>
  );
}
