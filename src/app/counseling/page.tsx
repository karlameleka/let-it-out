import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  SectionHeading,
  surfaceClass,
} from "@/components/ui";
import { Ribbon, Swash, DoodleField, WaveDivider } from "@/components/decor";
import { CalendarMark } from "@/components/illustrations";
import { FaqList } from "@/components/faq";

const COUNSELING_FAQ = [
  {
    question: "Is what I share in session confidential?",
    answer:
      "Yes. Everything you share with your counselor is confidential. The only exceptions are narrow legal and ethical ones — an imminent risk of serious harm to you or someone else, suspected abuse of a minor, or disclosure required by law. Your counselor will walk you through this at the start of your work together.",
  },
  {
    question: "What does a session actually look like?",
    answer:
      "Sessions run 50 minutes and are held one-on-one with your counselor over video call. Once your booking request is confirmed, you'll get the video link by email ahead of time.",
  },
  {
    question: "Can I choose which counselor I see?",
    answer:
      "Yes — browse profiles below and book directly with the counselor whose background and specialties feel like the right fit for you.",
  },
  {
    question: "What if I need to reschedule?",
    answer:
      "Just reach out as early as you can — by email or through the contact page — and we'll help you find a new time.",
  },
];

export const metadata: Metadata = {
  title: "Counseling",
  description:
    "One-on-one online counseling sessions with specialized psychotherapists, using CBT, ACT, and DBT frameworks.",
};

export default async function CounselingPage() {
  const counselors = await prisma.counselor.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-28">
        <AmbientGlow palette="brand" intensity={0.2} />
        <DoodleField />
        <Container className="relative">
          <Ribbon>Individual online counseling</Ribbon>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.14] tracking-tight text-brand-900 sm:text-[3.4rem]">
            One-on-one sessions with{" "}
            <span className="mark-swash italic text-brand-700">
              specialized<Swash />
            </span>{" "}
            psychotherapists.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-body">
            We bring evidence-based frameworks — like Cognitive Behavioral,
            Acceptance-and-Commitment, and Dialectical-Behavioral therapy —
            into a plan personalized to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Badge tone="outline">50-minute sessions</Badge>
            <Badge tone="outline">Held over video call</Badge>
            <Badge tone="outline">Licensed psychologists</Badge>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Choose your counselor"
            title="Meet our psychotherapists"
            description="Every counselor is a licensed psychologist. Pick a profile to view their background and request a session."
          />

          {counselors.length === 0 ? (
            <EmptyState
              className="mt-14 max-w-2xl"
              illustration={<CalendarMark className="h-9 w-9" />}
              title="No open profiles right now"
              description="Our counselors are at capacity while we onboard the next intake. Leave us a message and we'll reach out the moment a slot opens up."
              action={<ButtonLink href="/contact">Ask about availability</ButtonLink>}
            />
          ) : (
            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {counselors.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/counseling/${c.slug}`}
                  className={`group animate-rise-in flex flex-col p-8 ${surfaceClass()}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex h-15 w-15 items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 font-display text-lg font-semibold text-brand-700 shadow-ambient-sm">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-900">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {c.credentials}
                  </p>
                  <div className="mt-4 flex flex-1 flex-wrap items-start gap-2">
                    {c.specialties.slice(0, 3).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  <p className="link-grow mt-6 w-fit text-sm font-medium text-brand-600">
                    View profile &amp; book &rarr;
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <WaveDivider fill="fill-brand-50" className="-mb-px" />
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white py-20 sm:py-24">
        <AmbientGlow palette="brand" intensity={0.12} />
        <Container className="relative max-w-2xl">
          <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-10">
            <FaqList items={COUNSELING_FAQ} />
          </div>
        </Container>
      </section>
    </>
  );
}
