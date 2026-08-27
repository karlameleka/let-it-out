import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUpcomingPageData } from "@/lib/upcoming-items";
import { formatSlotTime } from "@/lib/format-slot";
import { Container, Eyebrow } from "@/components/ui";
import SessionRow from "./session-row";
import EventRow from "./event-row";
import ReflectionRow from "./reflection-row";
import MarkAllReadButton from "./mark-all-read-button";

export const metadata: Metadata = { title: "Upcoming" };

const SESSION_STATUS_KEYS: Record<string, string> = {
  PENDING_PAYMENT: "statusPendingPayment",
  CONFIRMED: "statusPaid",
  CANCELLED: "statusCancelled",
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
  const { sessions, events, reflections } = await getUpcomingPageData(session.email, session.userId, locale);

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const t2 = t as unknown as Record<string, string>;

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
              const statusLabel = statusKey ? t2[statusKey] : s.status;
              const dateTimeLabel =
                dateFormatter.format(new Date(`${s.date}T00:00:00`)) +
                (s.time && s.kind === "paid" ? ` · ${formatSlotTime(s.time, locale)}` : s.time ? ` · ${s.time}` : "");
              return (
                <SessionRow
                  key={s.id}
                  itemId={s.id}
                  bookingId={s.bookingId}
                  kind={s.kind}
                  href={s.href}
                  title={`Session with ${s.counselorName}`}
                  dateTimeLabel={dateTimeLabel}
                  statusLabel={statusLabel}
                  statusClassName={STATUS_STYLES[s.status] ?? "bg-ink/10 text-ink/60"}
                  canCancel={s.canCancel}
                  read={s.read}
                  meetingLink={s.meetingLink}
                  dict={t}
                />
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
            {events.map((e) => {
              const dateTimeLabel = `${dateFormatter.format(new Date(`${e.date}T00:00:00`))} · ${new Date(
                `${e.date}T${e.time}:00`,
              ).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })}${
                e.location ? ` · ${e.location}` : ""
              }`;
              return (
                <EventRow
                  key={e.id}
                  itemId={e.id}
                  eventId={e.id}
                  title={e.title}
                  dateTimeLabel={dateTimeLabel}
                  description={e.description}
                  myRsvp={e.myRsvp}
                  read={e.read}
                  meetingLink={e.meetingLink}
                  dict={t}
                />
              );
            })}
          </div>
        )}
      </div>

      {reflections.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-brand-900">{t.reflectionsHeading}</h2>
          <div className="mt-4 space-y-3">
            {reflections.map((r) => (
              <ReflectionRow
                key={r.id}
                itemId={r.id}
                title={t.reflectionTitle}
                body={t.reflectionBody}
                cta={t.reflectionCta}
                read={r.read}
                dict={t}
              />
            ))}
          </div>
        </div>
      )}

      {(sessions.length > 0 || events.length > 0 || reflections.length > 0) && (
        <div className="mt-10 flex justify-center border-t border-brand-100 pt-8">
          <MarkAllReadButton label={t.markAllRead} />
        </div>
      )}
    </Container>
  );
}
