import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getPastItems } from "@/lib/upcoming-items";
import { formatSlotTime } from "@/lib/format-slot";
import { Container, Eyebrow } from "@/components/ui";
import PastItemRow from "./past-item-row";

export const metadata: Metadata = { title: "Past Sessions" };

export default async function PastSessionsPage() {
  const [session, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!session) redirect("/login");

  const dict = getDictionary(locale);
  const t = dict.pastSessions;
  const { sessions, events } = await getPastItems(session.email, session.userId, locale);

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/upcoming" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToUpcoming}
      </Link>

      <div className="mt-4">
        <Eyebrow>{t.heading}</Eyebrow>
      </div>
      <h1 className="mt-2 font-display text-3xl font-medium text-brand-900 sm:text-4xl">{t.heading}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.subtitle}</p>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">{t.sessionsHeading}</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">{t.noSessions}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sessions.map((s) => {
              const dateTimeLabel =
                dateFormatter.format(new Date(`${s.date}T00:00:00`)) +
                (s.time && s.kind === "paid" ? ` · ${formatSlotTime(s.time, locale)}` : s.time ? ` · ${s.time}` : "");
              return (
                <PastItemRow
                  key={s.id}
                  itemId={s.id}
                  title={`Session with ${s.counselorName}`}
                  dateTimeLabel={dateTimeLabel}
                  deleteLabel={dict.upcoming.deleteNotification}
                  href="/journal/reflection"
                  cta={dict.upcoming.reflectionCta}
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
                <PastItemRow
                  key={e.id}
                  itemId={e.id}
                  title={e.title}
                  dateTimeLabel={dateTimeLabel}
                  deleteLabel={dict.upcoming.deleteNotification}
                />
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
