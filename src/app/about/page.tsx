import type { Metadata } from "next";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, Swash } from "@/components/decor";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Let It Out's story, mission, and vision since 2021.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>Who we are</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
            Psychologist-led mental health support,{" "}
            <span className="mark-swash italic text-brand-700">
              since 2021<Swash />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Founded by Egyptian psychologist Karla Meleka, Let It Out
            delivers professional mental health support tailored to your
            community&apos;s needs, reducing stigma, one mind at a time.
          </p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="border-b border-brand-100 py-10">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
            Trusted by teams and organizations including
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "e&",
              "Coca-Cola",
              "Nestlé",
              "BeReal Global",
              "Fahim Foundation",
              "Ministry of Youth",
            ].map((org) => (
              <span
                key={org}
                className="font-display text-lg font-semibold text-brand-800/70 sm:text-xl"
              >
                {org}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 pt-16 sm:pb-20">
        <Container className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-brand-100 bg-white p-8 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-brand-900">
              Our Vision
            </h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-500">
              Quality-driven
            </p>
            <p className="mt-4 text-ink/70">
              To create lasting value by improving quality mental health care
              and reducing stigma, one step at a time.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-brand-100 bg-white p-8 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-brand-900">
              Our Mission
            </h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-500">
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

      <section className="bg-brand-50 py-16 sm:py-20">
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
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs text-white">
                    ✓
                  </span>
                  <span className="text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-teal" height={200} className="drop-shadow-md" />
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

      <WaveDivider fill="fill-brand-800" className="-mb-px" />
      <section className="relative overflow-hidden bg-brand-800 py-16 text-white sm:py-20">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Let&apos;s start your journey to well-being, together.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/counseling" variant="bright">
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
