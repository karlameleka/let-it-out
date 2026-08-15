import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { FaqList } from "@/components/faq";
import CounselorFinder from "./counselor-finder";

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
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20">
        <DoodleField />
        <Container className="relative">
          <Ribbon>Individual online counseling</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
            One-on-one sessions with{" "}
            <span className="mark-swash italic text-brand-700">
              specialized<Swash />
            </span>{" "}
            psychotherapists.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            We bring evidence-based frameworks — like Cognitive Behavioral,
            Acceptance-and-Commitment, and Dialectical-Behavioral therapy —
            into a plan personalized to you.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Choose your counselor"
            title="Meet our psychotherapists"
            description="Every counselor is a licensed psychologist. Pick a profile to view their background and request a session."
          />
          <CounselorFinder counselors={counselors} />
        </Container>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <Container className="max-w-2xl">
          <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-8">
            <FaqList items={COUNSELING_FAQ} />
          </div>
        </Container>
      </section>
    </>
  );
}
