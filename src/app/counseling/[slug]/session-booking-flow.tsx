"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOffline } from "next/offline";
import { createSessionBooking, checkCounselingPromoCode } from "@/lib/session-booking-actions";
import { formatEGP } from "@/lib/format";
import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { formatSlotTime } from "@/lib/format-slot";
import PrivacyBadge from "@/components/privacy-badge";
import MonthCalendar from "@/components/month-calendar";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

const todayISO = () => new Date().toISOString().slice(0, 10);

export type SessionSlot = { date: string; time: string };

export default function SessionBookingFlow({
  counselorId,
  counselorName,
  priceEGP,
  dict,
  locale,
  account,
  slots = [],
}: {
  counselorId: string;
  counselorName: string;
  priceEGP: number;
  dict: Dictionary;
  locale: Locale;
  account?: { name: string; email: string; phone: string | null } | null;
  slots?: SessionSlot[];
}) {
  const t = dict.counselorProfile;
  const f = dict.forms;
  const router = useRouter();
  const isOffline = useOffline();
  const [useAccount, setUseAccount] = useState(!!account);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionBookingId, setSessionBookingId] = useState<string | null>(null);
  const [finalPriceEGP, setFinalPriceEGP] = useState(priceEGP);
  const [finalDate, setFinalDate] = useState<string | null>(null);
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const slotDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { weekday: "short", day: "numeric", month: "short" }),
    [locale],
  );

  const usingSlots = slots.length > 0;
  const byDate = useMemo(() => {
    const map = new Map<string, SessionSlot[]>();
    for (const slot of slots) {
      map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    }
    return map;
  }, [slots]);
  const dates = [...byDate.keys()];
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<SessionSlot | null>(slots[0] ?? null);
  const [promoApplied, setPromoApplied] = useState<{ code: string; discountEGP: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  async function applyPromoCode() {
    if (!promoInput.trim()) return;
    setPromoChecking(true);
    setPromoError(null);
    const result = await checkCounselingPromoCode(promoInput, counselorId, priceEGP);
    setPromoChecking(false);
    if (!result.valid) {
      setPromoError(result.error);
      setPromoApplied(null);
      return;
    }
    setPromoApplied({ code: result.code, discountEGP: result.discountEGP, label: result.label });
  }

  function removePromoCode() {
    setPromoApplied(null);
    setPromoInput("");
    setPromoError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;

    if (usingSlots && !selectedSlot) {
      setError(dict.bookingForm.pickTimeHeading);
      return;
    }

    const formData = new FormData(e.currentTarget);

    // createSessionBooking is a Server Action — with experimental.useOffline
    // on, calling it with no network leaves the promise pending indefinitely
    // instead of rejecting, so the button would otherwise spin forever with
    // no explanation. Fail fast with a clear message instead.
    if (isOffline) {
      setError(dict.offline.bookingNeedsConnection);
      return;
    }

    setPending(true);
    setError(null);

    const preferredDate = usingSlots ? (selectedSlot?.date ?? "") : String(formData.get("preferredDate") || "");
    const preferredTime = usingSlots ? (selectedSlot?.time ?? "") : undefined;

    const result = await createSessionBooking({
      counselorId,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      preferredDate,
      preferredTime,
      promoCode: promoApplied?.code,
    });

    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setFinalPriceEGP(priceEGP - (promoApplied?.discountEGP ?? 0));
    setFinalDate(preferredDate);
    setFinalTime(preferredTime ?? null);
    setSessionBookingId(result.sessionBookingId);
  }

  if (sessionBookingId) {
    return (
      <div>
        <p className="text-sm text-ink/70">
          {t.almostThere} <strong>{formatEGP(finalPriceEGP)}</strong> {t.almostThereSuffix} {counselorName}.
        </p>
        {finalDate && (
          <p className="mt-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800">
            {t.chosenTime}: {slotDateFormatter.format(new Date(`${finalDate}T00:00:00`))}
            {finalTime ? ` · ${formatSlotTime(finalTime, locale)}` : ""}
          </p>
        )}
        <div className="mt-4">
          <PaymentSelector
            amountEGP={finalPriceEGP}
            getOrderId={async () => sessionBookingId}
            endpoint="/api/checkout/paymob-session"
            idField="sessionBookingId"
            onRedirect={() => router.push(`/counseling/session/${sessionBookingId}`)}
            dict={dict.paymentSelector}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800">
        {promoApplied ? (
          <div className="flex items-center justify-between gap-2">
            <span>
              {t.sessionPrice}: <s className="text-brand-800/50">{formatEGP(priceEGP)}</s>{" "}
              {formatEGP(priceEGP - promoApplied.discountEGP)} &middot; &ldquo;{promoApplied.code}&rdquo; {promoApplied.label}
            </span>
            <button
              type="button"
              onClick={removePromoCode}
              className="shrink-0 text-xs font-medium text-brand-700/70 hover:text-brand-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <span>
            {t.sessionPrice}: {formatEGP(priceEGP)}
          </span>
        )}
      </div>
      {!promoApplied && (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Promo code (optional)"
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm uppercase tracking-wide outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={applyPromoCode}
              disabled={promoChecking || !promoInput.trim()}
              className="shrink-0 rounded-xl border-[1.5px] border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors disabled:opacity-50 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
            >
              {promoChecking ? "Checking…" : "Apply"}
            </button>
          </div>
          {promoError && <p className="mt-1.5 text-xs text-red-600">{promoError}</p>}
        </div>
      )}
      {account && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink/70">
              {useAccount ? (
                <>
                  {t.bookingAs} <span className="font-medium text-ink/90">{account.name}</span> · {account.email}
                  {account.phone ? ` · ${account.phone}` : ""}
                </>
              ) : (
                t.enteringManually
              )}
            </span>
            <button
              type="button"
              onClick={() => setUseAccount((v) => !v)}
              className="shrink-0 text-xs font-medium text-brand-600 link-grow"
            >
              {useAccount ? t.notYou : t.useMyDetails}
            </button>
          </div>
          {useAccount && (
            <>
              <input type="hidden" name="name" value={account.name} />
              <input type="hidden" name="email" value={account.email} />
              {account.phone && <input type="hidden" name="phone" value={account.phone} />}
            </>
          )}
        </div>
      )}
      {(!account || !useAccount) && (
        <>
          <div>
            <label className={labelClass} htmlFor="name">{f.name}</label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">{f.email}</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </>
      )}
      {(!account || !useAccount || !account.phone) && (
        <div>
          <label className={labelClass} htmlFor="phone">{f.phone}</label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
      )}
      {usingSlots ? (
        <div>
          <label className={labelClass}>{dict.bookingForm.pickTimeHeading}</label>
          <MonthCalendar
            highlightedDates={new Set(dates)}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(byDate.get(date)![0]);
            }}
            locale={locale}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {(byDate.get(selectedDate ?? "") ?? []).map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-brand-200 text-ink/70 hover:bg-brand-50"
                }`}
              >
                {formatSlotTime(slot.time, locale)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink/45">{dict.bookingForm.pickTimeHint}</p>
        </div>
      ) : (
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
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <PrivacyBadge text={dict.privacyBadge.booking} />
      <button
        type="submit"
        disabled={pending || isOffline}
        className="w-full rounded bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600 active:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] disabled:opacity-60"
      >
        {isOffline ? dict.offline.reconnectToContinue : pending ? t.justAMoment : t.continueToPayment}
      </button>
    </form>
  );
}
