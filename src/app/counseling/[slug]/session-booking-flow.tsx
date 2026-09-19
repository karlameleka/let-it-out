"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOffline } from "next/offline";
import { createSessionBooking, checkCounselingPromoCode } from "@/lib/session-booking-actions";
import PaymentSelector from "@/components/PaymentSelector";
import PriceDisplay from "@/components/price-display";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { formatSlotTime } from "@/lib/format-slot";
import PrivacyBadge from "@/components/privacy-badge";
import MonthCalendar from "@/components/month-calendar";
import HoneypotField from "@/components/honeypot-field";
import SimpleCaptcha from "@/components/simple-captcha";
import { HONEYPOT_FIELD } from "@/lib/anti-spam-shared";
import { Button } from "@/components/ui";
import { BookingProgress, BookingStepTransition } from "@/components/booking-wizard";

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
  const w = dict.bookingWizard;
  const router = useRouter();
  const isOffline = useOffline();
  const [useAccount, setUseAccount] = useState(!!account);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionBookingId, setSessionBookingId] = useState<string | null>(null);
  const [sessionBookingAccessToken, setSessionBookingAccessToken] = useState<string | null>(null);
  const [finalPriceEGP, setFinalPriceEGP] = useState(priceEGP);
  const [finalDate, setFinalDate] = useState<string | null>(null);
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const slotDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { weekday: "short", day: "numeric", month: "short" }),
    [locale],
  );

  // Multi-step wizard state — name/email/phone/preferredDate live here
  // (rather than being read from the DOM at submit time) specifically
  // because their <input>s only stay mounted while their own step is
  // active; by the time the user reaches the final "confirm" step and
  // submits, step 0's fields have long since unmounted.
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const rtlFlip = locale === "ar" ? -1 : 1;
  const STEPS = [w.stepDetails, w.stepTime, w.stepConfirm];
  const detailsFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const timeFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDateFallback, setPreferredDateFallback] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

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

  function goNext() {
    setStepError(null);
    if (step === 0) {
      if ((!account || !useAccount) && detailsFieldsetRef.current && !detailsFieldsetRef.current.reportValidity()) return;
    } else if (step === 1) {
      if (usingSlots) {
        if (!selectedSlot) {
          setStepError(dict.bookingForm.pickTimeHeading);
          return;
        }
      } else if (timeFieldsetRef.current && !timeFieldsetRef.current.reportValidity()) {
        return;
      }
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
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

    const preferredDate = usingSlots ? (selectedSlot?.date ?? "") : preferredDateFallback;
    const preferredTime = usingSlots ? (selectedSlot?.time ?? "") : undefined;
    const useAccountDetails = !!account && useAccount;

    const result = await createSessionBooking({
      counselorId,
      name: useAccountDetails ? account!.name : name,
      email: useAccountDetails ? account!.email : email,
      phone: useAccountDetails ? (account!.phone ?? phone) : phone,
      preferredDate,
      preferredTime,
      promoCode: promoApplied?.code,
      honeypot: String(formData.get(HONEYPOT_FIELD) || ""),
      captchaAnswer: String(formData.get("captchaAnswer") || ""),
      captchaExpected: String(formData.get("captchaExpected") || ""),
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
    setSessionBookingAccessToken(result.accessToken);
  }

  if (sessionBookingId) {
    return (
      <div>
        <p className="text-sm text-ink/70">
          {t.almostThere} <strong><PriceDisplay egpAmount={finalPriceEGP} /></strong> {t.almostThereSuffix} {counselorName}.
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
            getOrderId={async () => ({ id: sessionBookingId, accessToken: sessionBookingAccessToken ?? "" })}
            endpoint="/api/checkout/paymob-session"
            idField="sessionBookingId"
            onRedirect={() => router.push(`/counseling/session/${sessionBookingId}?token=${sessionBookingAccessToken}`)}
            dict={dict.paymentSelector}
          />
          {/* Temporary manual-payment fallback — counseling checkout only,
              remove once no longer needed. */}
          <div className="mt-4 flex items-center gap-3 text-xs text-ink/35">
            <span className="h-px flex-1 bg-brand-100" />
            <span>{locale === "ar" ? "أو" : "or"}</span>
            <span className="h-px flex-1 bg-brand-100" />
          </div>
          <a
            href="https://ipn.eg/S/letitout/instapay/26Ormc"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded border-2 border-brand-200 px-5 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {t.payWithInstapay}
          </a>
          <p className="mt-2 text-xs text-ink/45">{t.instapayNote}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <HoneypotField />
      <BookingProgress steps={STEPS} current={step} />

      <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800">
        {promoApplied ? (
          <div className="flex items-center justify-between gap-2">
            <span>
              {t.sessionPrice}: <s className="text-brand-800/50"><PriceDisplay egpAmount={priceEGP} /></s>{" "}
              <PriceDisplay egpAmount={priceEGP - promoApplied.discountEGP} /> &middot; &ldquo;{promoApplied.code}&rdquo; {promoApplied.label}
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
            {t.sessionPrice}: <PriceDisplay egpAmount={priceEGP} />
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

      <BookingStepTransition stepKey={step} direction={(direction * rtlFlip) as 1 | -1}>
        {step === 0 && (
          <fieldset ref={detailsFieldsetRef} className="space-y-4 border-0 p-0 m-0 min-w-0">
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
              </div>
            )}
            {(!account || !useAccount) && (
              <>
                <div>
                  <label className={labelClass} htmlFor="name">{f.name}</label>
                  <input
                    id="name"
                    required
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="email">{f.email}</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </>
            )}
            {(!account || !useAccount || !account.phone) && (
              <div>
                <label className={labelClass} htmlFor="phone">{f.phone}</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset ref={timeFieldsetRef} className="border-0 p-0 m-0 min-w-0">
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
                  type="date"
                  min={todayISO()}
                  required
                  className={inputClass}
                  value={preferredDateFallback}
                  onChange={(e) => setPreferredDateFallback(e.target.value)}
                />
                <p className="mt-1 text-xs text-ink/45">{t.preferredDayHint}</p>
              </div>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-100 bg-white px-4 py-3">
              <p className="text-sm font-medium text-ink/80">
                {useAccount && account ? account.name : name} · {useAccount && account ? account.email : email}
              </p>
              {(useAccount && account?.phone ? account.phone : phone) && (
                <p className="text-xs text-ink/50">{useAccount && account?.phone ? account.phone : phone}</p>
              )}
              <p className="mt-1.5 text-sm text-brand-700">
                {usingSlots && selectedSlot
                  ? `${slotDateFormatter.format(new Date(`${selectedSlot.date}T00:00:00`))} · ${formatSlotTime(selectedSlot.time, locale)}`
                  : slotDateFormatter.format(new Date(`${preferredDateFallback}T00:00:00`))}
              </p>
            </div>
            <SimpleCaptcha dict={f} />
          </div>
        )}
      </BookingStepTransition>

      {(stepError || error) && <p className="text-sm text-red-600">{stepError || error}</p>}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={goBack} className="!px-4">
            {w.back}
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          // Distinct `key`s from the submit button below are load-bearing,
          // not cosmetic: without them React reuses this exact DOM node
          // across the ternary, mutating its `type` attribute in place —
          // and since that mutation happens synchronously inside this very
          // click handler, the browser's native "activate submit button"
          // default action (which runs right after) sees the *new*
          // type="submit" on the *same* node and submits the form the
          // instant the last "Next" is clicked, skipping the confirm step
          // entirely. A fresh element per branch avoids the in-place
          // type swap altogether.
          <Button key="next" type="button" onClick={goNext} className="flex-1">
            {w.next}
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={pending || isOffline} className="flex-1">
            {isOffline ? dict.offline.reconnectToContinue : pending ? t.justAMoment : t.continueToPayment}
          </Button>
        )}
      </div>
      {step === STEPS.length - 1 && <PrivacyBadge text={dict.privacyBadge.booking} />}
    </form>
  );
}
