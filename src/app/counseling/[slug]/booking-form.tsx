"use client";

import { useActionState, useMemo, useState } from "react";
import { submitBookingRequest } from "@/lib/booking-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { formatSlotTime } from "@/lib/format-slot";
import PrivacyBadge from "@/components/privacy-badge";
import MonthCalendar from "@/components/month-calendar";

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

  const byDate = useMemo(() => {
    const map = new Map<string, BookingSlot[]>();
    for (const slot of slots) {
      map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    }
    return map;
  }, [slots]);
  const dates = [...byDate.keys()];
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const SESSION_TYPES = [
    { value: "INDIVIDUAL_COUNSELING", label: t.typeIndividual },
    { value: "COUPLES_COUNSELING", label: t.typeCouples },
    { value: "FOLLOW_UP", label: t.typeFollowUp },
    { value: "OTHER", label: t.typeOther },
  ];

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">{t.receivedTitle}</p>
        <p className="mt-2 text-sm text-ink/70">{t.receivedDescription}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="counselorId" value={counselorId} />
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
      <div>
        <label className={labelClass} htmlFor="sessionType">{t.sessionType}</label>
        <select id="sessionType" name="sessionType" defaultValue="INDIVIDUAL_COUNSELING" className={inputClass}>
          {SESSION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      {!customTime && dates.length > 0 ? (
        <div>
          <label className={labelClass}>{t.pickTimeHeading}</label>
          <input type="hidden" name="preferredDate" value={selectedSlot?.date ?? ""} />
          <input type="hidden" name="preferredTime" value={selectedSlot?.time ?? ""} />
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
              <label className={labelClass} htmlFor="preferredDate">{t.preferredDate}</label>
              <input id="preferredDate" name="preferredDate" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="preferredTime">{t.preferredTime}</label>
              <input id="preferredTime" name="preferredTime" type="time" required className={inputClass} />
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/45">{t.dateTimeHint}</p>
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="message">{t.messageLabel}</label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <PrivacyBadge text={dict.privacyBadge.booking} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? f.sending : t.submit}
      </Button>
    </form>
  );
}
