import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, Eyebrow } from "@/components/ui";

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
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Eyebrow>Individual online counseling</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-brand-900 sm:text-5xl">
            One-on-one sessions with specialized psychotherapists.
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
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {counselors.map((c) => (
              <Link
                key={c.id}
                href={`/counseling/${c.slug}`}
                className="group flex flex-col rounded-2xl border border-brand-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-display text-lg font-bold text-brand-700">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-brand-800">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-ink/60">{c.credentials}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.specialties.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium text-brand-600 group-hover:underline">
                  View profile &amp; book &rarr;
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
