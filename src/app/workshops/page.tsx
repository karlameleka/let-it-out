import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { WORKSHOP_TOPICS } from "@/lib/content/workshops";
import { Ribbon, Swash, WaveDivider, DoodleField } from "@/components/decor";
import WorkshopInquiryForm from "./inquiry-form";

export const metadata: Metadata = {
  title: "Corporate & Community Wellbeing Workshops",
  description:
    "Interactive, evidence-based workshops designed to enhance wellbeing for employees, teams, students, and parents.",
};

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "-rotate-1"];

export default function WorkshopsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20">
        <DoodleField />
        <Container className="relative">
          <Ribbon>Corporate &amp; community wellbeing</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
            Workshops built for{" "}
            <span className="mark-swash italic text-brand-700">
              real<Swash />
            </span>{" "}
            workplaces and communities.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Interactive, evidence-based sessions designed and tailored to
            enhance employee and community wellbeing — building awareness
            and giving practical tools people actually use.
          </p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-16 pt-4 sm:pb-20">
        <Container>
          <SectionHeading eyebrow="Topics" title="Popular workshop topics" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSHOP_TOPICS.map((topic, i) => (
              <div
                key={topic.slug}
                className={`group rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:rotate-0 hover:border-brand-300 hover:shadow-md ${ROTATIONS[i % ROTATIONS.length]}`}
              >
                <span className="font-display text-2xl font-semibold text-brand-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-brand-900">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{topic.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20" id="request-quote">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Container className="grid gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Let's work together"
              title="Request a workshop for your team or community"
              description="Share a few details about your organization and what you're looking for, and we'll follow up to design a session together."
            />
            <div className="mt-6 space-y-3 text-sm text-ink/70">
              <p className="font-semibold text-brand-800">Past sessions have included:</p>
              <ul className="space-y-1.5">
                {[
                  "Stress-management workshops for college students",
                  "Self-expression seminars for adults",
                  "Mental health first-aid workshops for employees",
                  "Trainings for parents, staff, and students",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <WorkshopInquiryForm />
        </Container>
      </section>
    </>
  );
}
