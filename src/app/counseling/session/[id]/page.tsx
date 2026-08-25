import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import CalBooking from "@/components/cal-booking";
import RetrySessionPayment from "./retry-session-payment";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function SessionBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, locale] = await Promise.all([
    prisma.sessionBooking.findUnique({ where: { id }, include: { counselor: true } }),
    getLocale(),
  ]);
  if (!booking) notFound();

  const t = getDictionary(locale).sessionStatus;

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-brand-600">
          {t.sessionWith} {booking.counselor.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-900">
          {booking.status !== "CONFIRMED"
            ? t.titlePending
            : booking.preferredTime
              ? t.titleConfirmedWithTime
              : t.titleConfirmed}
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {booking.status === "CONFIRMED" ? t.pillConfirmed : t.pillPending}
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
                <span>Discount</span>
                <span>-{formatEGP(booking.discountEGP)}</span>
              </div>
            </>
          )}
          <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-sm font-semibold">
            <span>{booking.discountEGP > 0 ? "Total" : t.price}</span>
            <span>{formatEGP(booking.priceEGP - booking.discountEGP)}</span>
          </div>
        </div>

        {booking.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.completePaymentHeading}</h2>
            <p className="mt-3 text-sm text-ink/80">{t.completePaymentText}</p>
            <div className="mt-6">
              <RetrySessionPayment sessionBookingId={booking.id} amountEGP={booking.priceEGP - booking.discountEGP} />
            </div>
          </div>
        )}

        {booking.status === "CONFIRMED" && booking.preferredTime && (
          <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-display font-semibold text-brand-900">{t.titleConfirmedWithTime}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.confirmedWithTimeText}</p>
          </div>
        )}

        {booking.status === "CONFIRMED" && !booking.preferredTime && booking.counselor.bookingUrl && (
          <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-display font-semibold text-brand-900">{t.pickTimeHeading}</h2>
            <p className="mt-1 text-sm text-ink/60">{t.pickTimeText}</p>
            <div className="mt-4">
              <CalBooking
                calLink={booking.counselor.bookingUrl.replace(/^https?:\/\/(www\.)?cal\.com\//, "")}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
