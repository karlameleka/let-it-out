import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, Eyebrow } from "@/components/ui";
import BookingForm from "./booking-form";
import CalBooking from "@/components/cal-booking";
import SessionBookingFlow from "./session-booking-flow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const counselor = await prisma.counselor.findUnique({ where: { slug } });
  if (!counselor) return {};
  return { title: counselor.name, description: counselor.bio.slice(0, 150) };
}

export default async function CounselorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const counselor = await prisma.counselor.findUnique({ where: { slug } });
  if (!counselor || !counselor.active) notFound();

  return (
    <section className="py-16 sm:py-20">
      <Container className="grid gap-12 md:grid-cols-5">
        <div className="md:col-span-3">
          <Eyebrow>Counseling</Eyebrow>
          <div className="mt-4 flex items-center gap-4">
            {counselor.photoUrl ? (
              <Image
                src={counselor.photoUrl}
                alt={counselor.name}
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-full border-2 border-brand-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-xl font-semibold text-brand-700">
                {counselor.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-semibold text-brand-900 sm:text-4xl">
                {counselor.name}
              </h1>
              <p className="text-sm font-medium text-brand-600">{counselor.credentials}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700">
              50-minute session
            </span>
            {counselor.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {s}
              </span>
            ))}
          </div>

          {counselor.languages.length > 0 && (
            <p className="mt-3 text-sm text-ink/60">
              <span className="font-medium text-ink/70">Speaks:</span> {counselor.languages.join(", ")}
            </p>
          )}

          <p className="mt-6 whitespace-pre-line text-ink/80 leading-relaxed">
            {counselor.bio}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="sticky top-24 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            {counselor.bookingUrl && counselor.priceEGP ? (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  Book a session
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Sessions run 50 minutes over video call. Pick your
                  preferred day and pay below — you&apos;ll then choose
                  your exact time slot and get a confirmation with your
                  video link right away.
                </p>
                <div className="mt-4">
                  <SessionBookingFlow
                    counselorId={counselor.id}
                    counselorName={counselor.name}
                    priceEGP={counselor.priceEGP}
                  />
                </div>
              </>
            ) : counselor.bookingUrl ? (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  Book a session
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Sessions run 50 minutes over video call. Pick an open
                  slot below — you&apos;ll get a confirmation with your
                  video link right away.
                </p>
                <div className="mt-4">
                  <CalBooking calLink={counselor.bookingUrl.replace(/^https?:\/\/(www\.)?cal\.com\//, "")} />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  Request a session
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Sessions run 50 minutes. Tell us a bit about what you&apos;re
                  looking for and your preferred timing, and we&apos;ll reach
                  out to confirm.
                </p>
                <div className="mt-6">
                  <BookingForm counselorId={counselor.id} />
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
