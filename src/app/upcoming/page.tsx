import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUpcomingPageData } from "@/lib/upcoming-items";
import { formatSlotTime } from "@/lib/format-slot";
import { Container, Eyebrow } from "@/components/ui";
import RSVPButtons from "./rsvp-buttons";

export const metadata: Metadata = { title: "Upcoming" };

const SESSION_STATUS_KEYS: Record<string, string> = {
  PENDING_PAYMENT: "statusPendingPayment",
  CONFIRMED: "statusPaid",
};

const REQUEST_STATUS_KEYS: Record<string, string> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  CANCELLED: "statusCancelled",
  COMPLETED: "statusCompleted",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-brand-50 text-brand-700",
  CANCELLED: "bg-ink/10 text-ink/60",
  COMPLETED: "bg-ink/10 text-ink/60",
};

export default async function UpcomingPage() {
  const [session, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!session) redirect("/login");

  const dict = getDictionary(locale);
  const t = dict.upcoming;
  const { sessions, events } = await getUpcomingPageData(session.email, session.userId);

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Container className="py-10 sm:py-14">
      <Eyebrow>{t.heading}</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-medium text-brand-900 sm:text-4xl">{t.heading}</h1>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">{t.sessionsHeading}</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">{t.noSessions}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sessions.map((s) => {
              const statusKey = s.kind === "paid" ? SESSION_STATUS_KEYS[s.status] : REQUEST_STATUS_KEYS[s.status];
              const statusLabel = statusKey ? (t as unknown as Record<string, string>)[statusKey] : s.status;
              const row = (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-5">
                  <div>
                    <p className="font-medium text-brand-900">Session with {s.counselorName}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {dateFormatter.format(new Date(`${s.date}T00:00:00`))}
                      {s.time && s.kind === "paid" ? ` · ${formatSlotTime(s.time, locale)}` : s.time ? ` · ${s.time}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[s.status] ?? "bg-ink/10 text-ink/60"}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
              return s.href ? (
                <Link key={s.id} href={s.href} className="block transition-opacity hover:opacity-80">
                  {row}
                </Link>
              ) : (
                <div key={s.id}>{row}</div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-brand-900">{t.eventsHeading}</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">{t.noEvents}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-2xl border border-brand-100 bg-white p-5">
                <p className="font-medium text-brand-900">{e.title}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {dateFormatter.format(new Date(`${e.date}T00:00:00`))} ·{" "}
                  {new Date(`${e.date}T${e.time}:00`).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.description && <p className="mt-2 text-sm text-ink/70">{e.description}</p>}
                <div className="mt-4">
                  <RSVPButtons eventId={e.id} current={e.myRsvp} dict={t} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
