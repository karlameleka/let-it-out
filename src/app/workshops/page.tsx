import type { Metadata } from "next";
import { Container, SectionHeading, Eyebrow } from "@/components/ui";
import { WORKSHOP_TOPICS } from "@/lib/content/workshops";
import WorkshopInquiryForm from "./inquiry-form";

export const metadata: Metadata = {
  title: "Corporate & Community Wellbeing Workshops",
  description:
    "Interactive, evidence-based workshops designed to enhance wellbeing for employees, teams, students, and parents.",
};

export default function WorkshopsPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Eyebrow>Corporate &amp; community wellbeing</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-brand-900 sm:text-5xl">
            Workshops built for real workplaces and communities.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Interactive, evidence-based sessions designed and tailored to
            enhance employee and community wellbeing — building awareness
            and giving practical tools people actually use.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Topics" title="Popular workshop topics" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSHOP_TOPICS.map((topic) => (
              <div
                key={topic.slug}
                className="rounded-2xl border border-brand-100 bg-white p-6"
              >
                <h3 className="font-display text-base font-semibold text-brand-800">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{topic.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-16 sm:py-20" id="request-quote">
        <Container className="grid gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Let's work together"
              title="Request a workshop for your team or community"
              description="Share a few details about your organization and what you're looking for, and we'll follow up to design a session together."
            />
            <div className="mt-6 space-y-3 text-sm text-ink/70">
              <p>Past sessions have included:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Stress-management workshops for college students</li>
                <li>Self-expression seminars for adults</li>
                <li>Mental health first-aid workshops for employees</li>
                <li>Trainings for parents, staff, and students</li>
              </ul>
            </div>
          </div>
          <WorkshopInquiryForm />
        </Container>
      </section>
    </>
  );
}
