import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import RetrySessionPayment from "./retry-session-payment";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getCurrentUser } from "@/lib/session";
import { verifyOrderAccessToken } from "@/lib/order-access";

export default async function SessionBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const [booking, locale, user] = await Promise.all([
    prisma.sessionBooking.findUnique({ where: { id }, include: { counselor: true } }),
    getLocale(),
    getCurrentUser(),
  ]);
  if (!booking) notFound();

  // The booking id alone (a Prisma cuid()) isn't a safe stand-in for an
  // ownership check — see order-access.ts. A logged-in client is recognized
  // by their account email matching the booking; a guest needs the access
  // token minted alongside this booking and carried in the confirmation
  // link/redirect.
  const isOwner = (user && user.email === booking.email) || verifyOrderAccessToken(token, booking.accessTokenHash);
  if (!isOwner) notFound();

  const fullDict = getDictionary(locale);
  const t = fullDict.sessionStatus;

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/counseling"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow"
        >
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToCounseling}
        </Link>
        <p className="mt-4 text-sm font-medium text-brand-600">
          {t.sessionWith} {booking.counselor.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-900">
          {booking.status === "CANCELLED"
            ? t.titleCancelled
            : booking.status !== "CONFIRMED"
              ? t.titlePending
              : booking.preferredTime
                ? t.titleConfirmedWithTime
                : t.titleConfirmed}
        </h1>
        <p
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            booking.status === "CANCELLED" ? "bg-ink/10 text-ink/60" : "bg-brand-50 text-brand-700"
          }`}
        >
          {booking.status === "CANCELLED" ? t.pillCancelled : booking.status === "CONFIRMED" ? t.pillConfirmed : t.pillPending}
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">{t.preferredDay}</span>
            <span className="font-medium">{booking.preferredDate}</span>
          </div>
          {booking.preferredTime && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-ink/70">{t.time}</span>
              <span className="font-medium">{booking.preferredTime}</span>
            </div>
          )}
          {booking.discountEGP > 0 && (
            <>
              <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-sm">
                <span className="text-ink/70">{t.price}</span>
                <span>{formatEGP(booking.priceEGP)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm text-brand-700">
                <span>{t.discount}</span>
                <span>-{formatEGP(booking.discountEGP)}</span>
              </div>
            </>
          )}
          <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-sm font-semibold">
            <span>{booking.discountEGP > 0 ? t.total : t.price}</span>
            <span>{formatEGP(booking.priceEGP - booking.discountEGP)}</span>
          </div>
        </div>

        {booking.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.completePaymentHeading}</h2>
            <p className="mt-3 text-sm text-ink/80">
              {booking.preferredTime ? t.completePaymentTextWithTime : t.completePaymentText}
            </p>
            <div className="mt-6">
              <RetrySessionPayment
                sessionBookingId={booking.id}
                accessToken={token}
                amountEGP={booking.priceEGP - booking.discountEGP}
                dict={fullDict.paymentSelector}
              />
            </div>
          </div>
        )}

        {booking.status === "CONFIRMED" && booking.preferredTime && (
          <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-display font-semibold text-brand-900">{t.titleConfirmedWithTime}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.confirmedWithTimeText}</p>
          </div>
        )}

        {booking.status === "CONFIRMED" && !booking.preferredTime && (
          <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-display font-semibold text-brand-900">{t.pickTimeHeading}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.pickTimeText}</p>
          </div>
        )}

        {booking.status === "CANCELLED" && (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-ink/5 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.titleCancelled}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.cancelledText}</p>
          </div>
        )}
      </div>
    </Container>
  );
}
