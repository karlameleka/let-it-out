import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, Eyebrow } from "@/components/ui";
import BookingForm from "./booking-form";
import CalBooking from "@/components/cal-booking";
import SessionBookingFlow from "./session-booking-flow";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

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
  const [counselor, locale] = await Promise.all([
    prisma.counselor.findUnique({ where: { slug } }),
    getLocale(),
  ]);
  if (!counselor || !counselor.active) notFound();

  const dict = getDictionary(locale);
  const t = dict.counselorProfile;

  return (
    <section className="pt-6 pb-10 sm:pt-14 sm:pb-20">
      <Container className="grid gap-12 md:grid-cols-5">
        <div className="md:col-span-3">
          <Eyebrow>{dict.nav.counseling}</Eyebrow>
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-medium text-brand-900 sm:text-4xl">
                  {counselor.name}
                </h1>
                {counselor.availabilityStatus !== "AVAILABLE" && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      counselor.availabilityStatus === "WAITLIST"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-ink/10 text-ink/60"
                    }`}
                  >
                    {counselor.availabilityStatus === "WAITLIST"
                      ? dict.counseling.waitlistBadge
                      : dict.counseling.unavailableBadge}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-brand-600">{counselor.credentials}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700">
              {dict.counseling.sessionLengthBadge}
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
              <span className="font-medium text-ink/70">{dict.counseling.speaks}:</span>{" "}
              {counselor.languages.join(", ")}
            </p>
          )}

          <p className="mt-6 whitespace-pre-line text-ink/80 leading-relaxed">
            {counselor.bio}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="sticky top-24 rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm">
            {counselor.availabilityStatus !== "AVAILABLE" ? (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  {counselor.availabilityStatus === "WAITLIST"
                    ? dict.counselorProfile.waitlistHeading
                    : dict.counselorProfile.unavailableHeading}
                </h2>
                <p className="mt-2 text-sm text-ink/60">
                  {counselor.availabilityStatus === "WAITLIST"
                    ? dict.counselorProfile.waitlistDescription
                    : dict.counselorProfile.unavailableDescription}
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600"
                >
                  {dict.counselorProfile.contactCta}
                </Link>
              </>
            ) : counselor.bookingUrl && counselor.priceEGP ? (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  {t.bookHeading}
                </h2>
                <p className="mt-1 text-sm text-ink/60">{t.bookDescription}</p>
                <div className="mt-4">
                  <SessionBookingFlow
                    counselorId={counselor.id}
                    counselorName={counselor.name}
                    priceEGP={counselor.priceEGP}
                    dict={dict}
                  />
                </div>
              </>
            ) : counselor.bookingUrl ? (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  {t.calBookHeading}
                </h2>
                <p className="mt-1 text-sm text-ink/60">{t.calBookDescription}</p>
                <div className="mt-4">
                  <CalBooking calLink={counselor.bookingUrl.replace(/^https?:\/\/(www\.)?cal\.com\//, "")} />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-brand-900">
                  {t.requestHeading}
                </h2>
                <p className="mt-1 text-sm text-ink/60">{t.requestDescription}</p>
                <div className="mt-6">
                  <BookingForm counselorId={counselor.id} dict={dict} />
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
