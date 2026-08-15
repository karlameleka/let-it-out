import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  Container,
  Eyebrow,
  Surface,
} from "@/components/ui";
import BookingForm from "./booking-form";
import CalBooking from "@/components/cal-booking";

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
    <section className="relative overflow-hidden py-20 sm:py-24">
      <AmbientGlow palette="brand" intensity={0.14} className="h-[40rem]" />
      <Container className="relative grid gap-12 md:grid-cols-5 lg:gap-16">
        <div className="md:col-span-3">
          <Eyebrow>Counseling</Eyebrow>
          <div className="mt-6 flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 font-display text-2xl font-semibold text-brand-700 shadow-ambient">
              {counselor.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-4xl">
                {counselor.name}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-brand-600">
                {counselor.credentials}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="outline">50-minute session</Badge>
            {counselor.specialties.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <p className="prose-longform mt-10 whitespace-pre-line text-base text-ink-body">
            {counselor.bio}
          </p>
        </div>

        <div className="md:col-span-2">
          <Surface className="sticky top-24 p-7 sm:p-8">
            {counselor.bookingUrl ? (
              <>
                <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">
                  Book a session
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Sessions run 50 minutes over video call. Pick an open
                  slot below — you&apos;ll get a confirmation with your
                  video link right away.
                </p>
                <div className="mt-6">
                  <CalBooking calLink={counselor.bookingUrl.replace(/^https?:\/\/(www\.)?cal\.com\//, "")} />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">
                  Request a session
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Sessions run 50 minutes. Tell us a bit about what you&apos;re
                  looking for and your preferred timing, and we&apos;ll reach
                  out to confirm.
                </p>
                <div className="mt-7">
                  <BookingForm counselorId={counselor.id} />
                </div>
              </>
            )}
          </Surface>
        </div>
      </Container>
    </section>
  );
}
