"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { submitBookingRequest } from "@/lib/booking-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { formatSlotTime } from "@/lib/format-slot";
import PrivacyBadge from "@/components/privacy-badge";
import MonthCalendar from "@/components/month-calendar";
import HoneypotField from "@/components/honeypot-field";
import SimpleCaptcha from "@/components/simple-captcha";
import { BookingProgress, BookingStepTransition } from "@/components/booking-wizard";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export type BookingSlot = { date: string; time: string };

export default function BookingForm({
  counselorId,
  dict,
  locale,
  account,
  slots = [],
}: {
  counselorId: string;
  dict: Dictionary;
  locale: Locale;
  account?: { name: string; email: string; phone: string | null } | null;
  slots?: BookingSlot[];
}) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, undefined);
  const [useAccount, setUseAccount] = useState(!!account);
  const [customTime, setCustomTime] = useState(slots.length === 0);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(slots[0] ?? null);
  const t = dict.bookingForm;
  const f = dict.forms;
  const w = dict.bookingWizard;

  const byDate = useMemo(() => {
    const map = new Map<string, BookingSlot[]>();
    for (const slot of slots) {
      map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    }
    return map;
  }, [slots]);
  const dates = [...byDate.keys()];
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  // Multi-step wizard state — name/email/phone/sessionType/fallback
  // date+time live here (mirrored into always-mounted hidden inputs
  // below) because their editable <input>s only stay mounted while
  // their own step is active, but the real <form action={formAction}>
  // submission — happening from whichever step holds the submit button —
  // needs every field present in the DOM at that moment.
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const rtlFlip = locale === "ar" ? -1 : 1;
  const STEPS = [w.stepDetails, w.stepTime, w.stepConfirm];
  const detailsFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const timeFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionType, setSessionType] = useState("INDIVIDUAL_COUNSELING");
  const [fallbackDate, setFallbackDate] = useState("");
  const [fallbackTime, setFallbackTime] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  const SESSION_TYPES = [
    { value: "INDIVIDUAL_COUNSELING", label: t.typeIndividual },
    { value: "COUPLES_COUNSELING", label: t.typeCouples },
    { value: "FOLLOW_UP", label: t.typeFollowUp },
    { value: "OTHER", label: t.typeOther },
  ];

  function goNext() {
    setStepError(null);
    if (step === 0) {
      if ((!account || !useAccount) && detailsFieldsetRef.current && !detailsFieldsetRef.current.reportValidity()) return;
    } else if (step === 1) {
      if (!customTime && dates.length > 0) {
        if (!selectedSlot) {
          setStepError(t.pickTimeHeading);
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

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">{t.receivedTitle}</p>
        <p className="mt-2 text-sm text-ink/70">{t.receivedDescription}</p>
      </div>
    );
  }

  const usingSlots = !customTime && dates.length > 0;

  return (
    <form action={formAction} className="space-y-5">
      <HoneypotField />
      <input type="hidden" name="counselorId" value={counselorId} />
      {/* Always-mounted mirrors of step-local controlled state, so the
          actual submitted FormData has every field regardless of which
          step is visually active when the user hits submit. */}
      <input type="hidden" name="name" value={useAccount && account ? account.name : name} />
      <input type="hidden" name="email" value={useAccount && account ? account.email : email} />
      <input type="hidden" name="phone" value={useAccount && account?.phone ? account.phone : phone} />
      <input type="hidden" name="sessionType" value={sessionType} />
      <input type="hidden" name="preferredDate" value={usingSlots ? (selectedSlot?.date ?? "") : fallbackDate} />
      <input type="hidden" name="preferredTime" value={usingSlots ? (selectedSlot?.time ?? "") : fallbackTime} />

      <BookingProgress steps={STEPS} current={step} />

      <BookingStepTransition stepKey={step} direction={(direction * rtlFlip) as 1 | -1}>
        {step === 0 && (
          <fieldset ref={detailsFieldsetRef} className="space-y-4 border-0 p-0 m-0 min-w-0">
            {account && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink/70">
                    {useAccount ? (
                      <>
                        {dict.counselorProfile.bookingAs} <span className="font-medium text-ink/90">{account.name}</span> ·{" "}
                        {account.email}
                        {account.phone ? ` · ${account.phone}` : ""}
                      </>
                    ) : (
                      dict.counselorProfile.enteringManually
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseAccount((v) => !v)}
                    className="shrink-0 text-xs font-medium text-brand-600 link-grow"
                  >
                    {useAccount ? dict.counselorProfile.notYou : dict.counselorProfile.useMyDetails}
                  </button>
                </div>
              </div>
            )}
            {(!account || !useAccount) && (
              <>
                <div>
                  <label className={labelClass} htmlFor="name-visible">{f.name}</label>
                  <input
                    id="name-visible"
                    required
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="email-visible">{f.email}</label>
                  <input
                    id="email-visible"
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
                <label className={labelClass} htmlFor="phone-visible">{f.phone}</label>
                <input
                  id="phone-visible"
                  type="tel"
                  required
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className={labelClass} htmlFor="sessionType-visible">{t.sessionType}</label>
              <select
                id="sessionType-visible"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className={inputClass}
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset ref={timeFieldsetRef} className="border-0 p-0 m-0 min-w-0">
            {usingSlots ? (
              <div>
                <label className={labelClass}>{t.pickTimeHeading}</label>
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
                <p className="mt-2 text-xs text-ink/45">{t.pickTimeHint}</p>
                <button
                  type="button"
                  onClick={() => setCustomTime(true)}
                  className="mt-2 text-xs font-medium text-brand-600 link-grow"
                >
                  {t.useCustomTimeLink}
                </button>
              </div>
            ) : (
              <div>
                {dates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomTime(false)}
                    className="mb-2 text-xs font-medium text-brand-600 link-grow"
                  >
                    {t.useSlotsLink}
                  </button>
                )}
                {dates.length === 0 && <p className="mb-2 text-xs text-ink/45">{t.noSlotsMessage}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="preferredDate-visible">{t.preferredDate}</label>
                    <input
                      id="preferredDate-visible"
                      type="date"
                      required
                      className={inputClass}
                      value={fallbackDate}
                      onChange={(e) => setFallbackDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="preferredTime-visible">{t.preferredTime}</label>
                    <input
                      id="preferredTime-visible"
                      type="time"
                      required
                      className={inputClass}
                      value={fallbackTime}
                      onChange={(e) => setFallbackTime(e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink/45">{t.dateTimeHint}</p>
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
              <p className="mt-1.5 text-sm text-brand-700">
                {usingSlots && selectedSlot
                  ? formatSlotTime(selectedSlot.time, locale)
                  : `${fallbackDate} · ${fallbackTime}`}
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="message">{t.messageLabel}</label>
              <textarea id="message" name="message" rows={3} className={inputClass} />
            </div>
            <SimpleCaptcha dict={f} />
          </div>
        )}
      </BookingStepTransition>

      {(stepError || state?.error) && <p className="text-sm text-red-600">{stepError || state?.error}</p>}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={goBack} className="!px-4">
            {w.back}
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          // See the matching comment in session-booking-flow.tsx — distinct
          // `key`s stop React from reusing this DOM node (and mutating its
          // type="button" to type="submit" in place) across the ternary,
          // which would otherwise submit the form on the final "Next"
          // click via the browser's native post-click default action.
          <Button key="next" type="button" onClick={goNext} className="flex-1">
            {w.next}
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={pending} className="flex-1">
            {pending ? f.sending : t.submit}
          </Button>
        )}
      </div>
      {step === STEPS.length - 1 && <PrivacyBadge text={dict.privacyBadge.booking} />}
    </form>
  );
}
