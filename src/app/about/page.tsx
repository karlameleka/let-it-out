import type { Metadata } from "next";
import { Container, SectionHeading, Eyebrow, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Let It Out's story, mission, and vision since 2021.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Eyebrow>Who we are</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-brand-900 sm:text-5xl">
            Psychologist-led mental health support, since 2021.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Founded by Karla Meleka, psychologist and trainer, Let It Out
            delivers professional mental health support tailored to your
            community&apos;s needs.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-brand-800">
              Our Vision
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-accent-500">
              Quality-driven
            </p>
            <p className="mt-4 text-ink/70">
              To create lasting value by improving quality mental health care
              and reducing stigma, one step at a time.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-brand-800">
              Our Mission
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-accent-500">
              Evidence-based
            </p>
            <p className="mt-4 text-ink/70">
              To enhance mental health and wellbeing through evidence-based
              research, practical solutions, and compassionate collaboration
              centered on people&apos;s needs.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-16 sm:py-20">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="What we stand for"
              title="Practical, accessible, compassionate care"
            />
            <ul className="mt-6 space-y-4">
              {[
                "Psychologist-led expertise",
                "Evidence-based approaches",
                "Practical, accessible, compassionate care",
                "Tailored to your unique needs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
                    ✓
                  </span>
                  <span className="text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-teal" height={200} />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Community engagement"
            title="Building healthier, more supportive environments"
            description="We are committed to supporting workplace mental wellbeing through engaging corporate and community workshops that build awareness and provide practical tools for employees, teams, students, and parents."
          />
        </Container>
      </section>

      <section className="bg-brand-700 py-16 text-white sm:py-20">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Let&apos;s start your journey to well-being, together.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/counseling" variant="accent">
              Book a session
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-inverse">
              Contact us
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
