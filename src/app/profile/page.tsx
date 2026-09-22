import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotebookPen, LockKeyhole } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUpcomingPageData, getPastItems, hasConfirmedSession } from "@/lib/upcoming-items";
import { getArticles, localizeArticle } from "@/lib/content/articles";
import { getMyAssignedResources } from "@/lib/client-resources";
import { getMyOrders } from "@/lib/my-orders";
import { formatSlotTime } from "@/lib/format-slot";
import { formatEGP } from "@/lib/format";
import { Container, Eyebrow, Button, ButtonLink } from "@/components/ui";
import ProfileClient from "./profile-client";
import MyToolsItem from "./my-tools-item";
import MyToolsViewedTracker from "./my-tools-viewed-tracker";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.profile;

  const [{ sessions: upcomingSessions }, { sessions: pastSessions }, rawArticles, medications, myTools, canUseInBetweenSessions, orders] =
    await Promise.all([
      // excludeDismissed: false — dismissing a notification on /upcoming
      // is about hiding it from the notification feed, not about whether
      // the underlying session still happened/is booked; My Profile's
      // summary shouldn't silently lose a session just because its
      // notification was swiped away.
      getUpcomingPageData(user.email, user.userId, locale, { excludeDismissed: false }),
      getPastItems(user.email, user.userId, locale, { excludeDismissed: false }),
      getArticles(),
      prisma.medication.findMany({
        where: { clientEmail: user.email, active: true },
        include: { counselor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      getMyAssignedResources(user.email),
      hasConfirmedSession(user.email),
      getMyOrders(user.userId),
    ]);
  const articles = rawArticles.map((a) => localizeArticle(a, locale));

  const nextSession = upcomingSessions.find((s) => s.status !== "CANCELLED") ?? null;
  const lastPastSession = pastSessions[0] ?? null;
  const latestOrder = orders[0] ?? null;

  const ORDER_STATUS_LABEL: Record<string, string> = {
    PENDING_PAYMENT: dict.orderStatus.statusPendingPayment,
    PAYMENT_SUBMITTED: dict.orderStatus.statusPaymentSubmitted,
    CONFIRMED: dict.orderStatus.statusConfirmed,
    SHIPPED: dict.orderStatus.statusShipped,
    COMPLETED: dict.orderStatus.statusCompleted,
    CANCELLED: dict.orderStatus.statusCancelled,
  };

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  function formatSessionDateTime(date: string, time?: string | null) {
    const base = dateFormatter.format(new Date(`${date}T00:00:00`));
    return time ? `${base} · ${formatSlotTime(time, locale)}` : base;
  }

  return (
    <Container className="max-w-2xl pt-6 pb-10 sm:pt-14 sm:pb-20">
      <Eyebrow>{t.title}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.greeting.replace("{name}", user.name)}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.signedInAs} {user.email}</p>

      <ProfileClient userId={user.userId} locale={locale} articles={articles} dict={t} />

      <div id="my-tools" className="mt-6 scroll-mt-24 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <MyToolsViewedTracker hasUnviewed={myTools.some((item) => !item.viewedAt)} />
        <h2 className="font-display font-semibold text-brand-900">{t.myToolsTitle}</h2>
        {myTools.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">{t.myToolsEmpty}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {myTools.map((item) => (
              <MyToolsItem key={item.id} item={item} dict={dict.myTools} />
            ))}
          </div>
        )}
      </div>

      {medications.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="font-display font-semibold text-brand-900">{t.medicationsTitle}</h2>
          <div className="mt-3 space-y-2">
            {medications.map((m) => (
              <div key={m.id} className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
                <p className="text-sm font-medium text-brand-900">
                  {m.name}
                  {m.dosage && <span className="font-normal text-ink/60"> · {m.dosage}</span>}
                </p>
                {m.instructions && <p className="mt-1 text-sm text-ink/70">{m.instructions}</p>}
                <p className="mt-1 text-xs text-ink/40">
                  {t.prescribedBy.replace("{name}", m.counselor.name)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.sessionsTitle}</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{t.nextUpcoming}</p>
            {nextSession ? (
              <p className="mt-1 text-sm text-ink/80">
                {nextSession.counselorName} · {formatSessionDateTime(nextSession.date, nextSession.time)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/50">{t.noUpcoming}</p>
            )}
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{t.mostRecent}</p>
            {lastPastSession ? (
              <p className="mt-1 text-sm text-ink/80">
                {lastPastSession.counselorName} · {formatSessionDateTime(lastPastSession.date, lastPastSession.time)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/50">{t.noPast}</p>
            )}
          </div>
        </div>
        {nextSession || lastPastSession ? (
          <ButtonLink href="/upcoming" variant="outline" className="mt-4 w-full">
            {t.viewAllSessions}
          </ButtonLink>
        ) : (
          <ButtonLink href="/counseling" variant="outline" className="mt-4 w-full">
            {dict.nav.bookASession}
          </ButtonLink>
        )}
        {canUseInBetweenSessions ? (
          <ButtonLink href="/journal/reflection" variant="outline" className="mt-3 w-full">
            <NotebookPen className="h-4 w-4" strokeWidth={2} />
            {t.inBetweenSessions}
          </ButtonLink>
        ) : (
          <>
            <Button disabled variant="outline" className="mt-3 w-full">
              <LockKeyhole className="h-4 w-4" strokeWidth={2} />
              {t.inBetweenSessions}
            </Button>
            <p className="mt-2 text-center text-xs text-ink/40">{t.inBetweenSessionsLocked}</p>
          </>
        )}
      </div>

      <div className="mt-6 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.myOrdersTitle}</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{t.latestOrder}</p>
            {latestOrder ? (
              <p className="mt-1 text-sm text-ink/80">
                {dict.orderStatus.orderNumber.replace("{id}", latestOrder.id.slice(-8).toUpperCase())} ·{" "}
                {ORDER_STATUS_LABEL[latestOrder.status] ?? latestOrder.status} · {formatEGP(latestOrder.totalEGP)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/50">{t.noOrders}</p>
            )}
          </div>
        </div>
        {latestOrder ? (
          <ButtonLink href="/orders" variant="outline" className="mt-4 w-full">
            {t.viewAllOrders}
          </ButtonLink>
        ) : (
          <ButtonLink href="/shop" variant="outline" className="mt-4 w-full">
            {dict.myOrders.browseShop}
          </ButtonLink>
        )}
      </div>
    </Container>
  );
}
