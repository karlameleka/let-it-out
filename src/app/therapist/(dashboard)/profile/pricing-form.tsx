"use client";

import { useActionState } from "react";
import { updateTherapistPricing } from "@/lib/therapist-actions";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available — booking is live" },
  { value: "WAITLIST", label: "Waitlist — shows a badge, booking hidden" },
  { value: "UNAVAILABLE", label: "Unavailable — shows a badge, booking hidden" },
] as const;

export default function TherapistPricingForm({
  priceEGP,
  availabilityStatus,
  bookingUrl,
}: {
  priceEGP: number | null;
  availabilityStatus: string;
  bookingUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateTherapistPricing, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="priceEGP" className={labelClass}>Session price (EGP)</label>
        <input
          id="priceEGP"
          name="priceEGP"
          type="number"
          min={0}
          defaultValue={priceEGP ?? ""}
          placeholder="Not set"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-ink/50">
          When set alongside your Cal.com link below, clients pay this before picking their exact time slot.
        </p>
      </div>

      <div>
        <label htmlFor="availabilityStatus" className={labelClass}>Availability</label>
        <select id="availabilityStatus" name="availabilityStatus" defaultValue={availabilityStatus} className={fieldClass}>
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bookingUrl" className={labelClass}>Cal.com booking link</label>
        <input
          id="bookingUrl"
          name="bookingUrl"
          type="url"
          defaultValue={bookingUrl ?? ""}
          placeholder="https://cal.com/your-name/50min"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-ink/50">
          Your live scheduling calendar. Set this up once in Cal.com, then paste the link here — that&rsquo;s
          where clients pick their exact time and where your real availability lives.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-brand-600">Saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
