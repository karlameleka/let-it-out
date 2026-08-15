"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSessionBooking } from "@/lib/session-booking-actions";
import { formatEGP } from "@/lib/format";
import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";
import PrivacyBadge from "@/components/privacy-badge";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function SessionBookingFlow({
  counselorId,
  counselorName,
  priceEGP,
  dict,
}: {
  counselorId: string;
  counselorName: string;
  priceEGP: number;
  dict: Dictionary;
}) {
  const t = dict.counselorProfile;
  const f = dict.forms;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionBookingId, setSessionBookingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;

    const formData = new FormData(e.currentTarget);
    setPending(true);
    setError(null);

    const result = await createSessionBooking({
      counselorId,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      preferredDate: String(formData.get("preferredDate") || ""),
    });

    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setSessionBookingId(result.sessionBookingId);
  }

  if (sessionBookingId) {
    return (
      <div>
        <p className="text-sm text-ink/70">
          {t.almostThere} <strong>{formatEGP(priceEGP)}</strong> {t.almostThereSuffix} {counselorName}.
        </p>
        <div className="mt-4">
          <PaymentSelector
            amountEGP={priceEGP}
            getOrderId={async () => sessionBookingId}
            endpoint="/api/checkout/paymob-session"
            idField="sessionBookingId"
            onRedirect={() => router.push(`/counseling/session/${sessionBookingId}`)}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800">
        {t.sessionPrice}: {formatEGP(priceEGP)}
      </p>
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
        <label className={labelClass} htmlFor="preferredDate">{t.preferredDay}</label>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          min={todayISO()}
          required
          className={inputClass}
        />
        <p className="mt-1 text-xs text-ink/45">{t.preferredDayHint}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <PrivacyBadge text={dict.privacyBadge.booking} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] disabled:opacity-60"
      >
        {pending ? t.justAMoment : t.continueToPayment}
      </button>
    </form>
  );
}
