import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import CalBooking from "@/components/cal-booking";
import RetrySessionPayment from "./retry-session-payment";

export default async function SessionBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.sessionBooking.findUnique({
    where: { id },
    include: { counselor: true },
  });
  if (!booking) notFound();

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-brand-600">Session with {booking.counselor.name}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-brand-900">
          {booking.status === "CONFIRMED" ? "Payment received — pick your time" : "Complete your payment"}
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {booking.status === "CONFIRMED" ? "Payment confirmed" : "Awaiting payment"}
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Preferred day</span>
            <span className="font-medium">{booking.preferredDate}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-sm font-semibold">
            <span>Price</span>
            <span>{formatEGP(booking.priceEGP)}</span>
          </div>
        </div>

        {booking.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">Complete your payment</h2>
            <p className="mt-3 text-sm text-ink/80">
              Your booking is saved but not yet confirmed. Finish payment below to unlock the
              scheduler and pick your exact session time.
            </p>
            <div className="mt-6">
              <RetrySessionPayment sessionBookingId={booking.id} amountEGP={booking.priceEGP} />
            </div>
          </div>
        )}

        {booking.status === "CONFIRMED" && booking.counselor.bookingUrl && (
          <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-display font-semibold text-brand-900">Pick your session time</h2>
            <p className="mt-1 text-sm text-ink/60">
              Sessions run 50 minutes over video call. Pick an open slot below — you&apos;ll get a
              confirmation with your video link right away.
            </p>
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
