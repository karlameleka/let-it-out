import type { Metadata } from "next";
import Image from "next/image";
import { getCurrentUser } from "@/lib/session";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Ribbon, Swash, WaveDivider, DoodleField } from "@/components/decor";
import JournalLockGate from "@/components/journal-lock-gate";
import JournalFeed from "./journal-feed";

export const metadata: Metadata = { title: "Your Journal" };

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Get a daily prompt",
    description: "A fresh, rotating prompt each time — no blank page to stare at.",
  },
  {
    step: "2",
    title: "Write freely",
    description: "A few sentences or a full page — there's no right answer, and it's private.",
  },
  {
    step: "3",
    title: "Build your streak",
    description: "Look back on old entries anytime and watch your self-reflection habit grow.",
  },
];

const SAMPLE_PROMPTS = [
  {
    category: "Self-Awareness",
    text: "When do you feel most like yourself, and what tends to pull you away from that?",
  },
  {
    category: "Rest & Restoration",
    text: "What signals does your body give you before you're burnt out? Are you listening to them?",
  },
  {
    category: "Self-Love",
    text: "Write down three things about yourself that have nothing to do with productivity or achievement.",
  },
];

export default async function JournalPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-50">
          <DoodleField />
          <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Ribbon>Free journaling app</Ribbon>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
                Let it out,{" "}
                <span className="mark-swash italic text-brand-700">
                  one page<Swash />
                </span>{" "}
                at a time.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-ink/70">
                A free, guided journaling space with rotating daily prompts —
                no pressure, no perfect entries, just a little time for
                yourself.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <ButtonLink href="/signup">Start journaling — it&apos;s free</ButtonLink>
                <ButtonLink href="/login" variant="outline">
                  Log in
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-sm lg:block">
              <div className="animate-pop-in absolute -left-4 top-0 w-72 -rotate-3 rounded-2xl border border-brand-200 bg-white p-5 shadow-lg">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                  Today&apos;s prompt
                </p>
                <p className="mt-2 font-display text-base italic leading-snug text-brand-900">
                  &ldquo;What would you do if you trusted yourself completely,
                  just for one day?&rdquo;
                </p>
              </div>
              <div className="animate-float-slow ml-20 mt-44 w-64 rotate-2 rounded-2xl bg-brand-700 p-6 text-white shadow-xl">
                <p className="font-display text-4xl font-semibold leading-none">12</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-brand-100">
                  Day streak
                </p>
                <p className="mt-2 text-sm text-brand-50/80">
                  and counting — one small page at a time.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <WaveDivider fill="fill-white" />

        {/* How it works */}
        <section className="pb-4 pt-4 sm:pb-8">
          <Container>
            <SectionHeading
              eyebrow="How it works"
              title="Three small steps, real change"
              description="No blank page, no pressure — just show up for a few minutes."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item, i) => (
                <div
                  key={item.step}
                  className={`group relative rounded-2xl border-2 border-brand-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lg ${
                    i === 1 ? "sm:mt-8" : ""
                  }`}
                >
                  <span className="font-display text-4xl font-semibold text-brand-100 transition-colors group-hover:text-brand-200">
                    {item.step}
                  </span>
                  <p className="mt-2 font-display text-lg font-semibold text-brand-900">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm text-ink/70">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Prompt showcase */}
        <section className="relative mt-20 overflow-hidden bg-brand-800 py-24 text-white">
          <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-800" />
          <Image
            src="/brand/logo-icon-white.png"
            alt=""
            width={852}
            height={829}
            className="pointer-events-none absolute -bottom-16 -right-14 h-64 w-64 opacity-[0.06]"
          />
          <Container className="relative">
            <Ribbon tone="dark">Real prompts from the app</Ribbon>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold sm:text-4xl">
              Never stare at a blank page again
            </h2>
            <p className="mt-4 max-w-lg text-brand-50/85">
              Every entry starts with a fresh, rotating prompt — pulled from a
              library of 100+, crafted to open something up.
            </p>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {SAMPLE_PROMPTS.map((p, i) => (
                <div
                  key={p.category}
                  className={`rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm ${
                    i === 1 ? "sm:-translate-y-4" : ""
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-200">
                    {p.category}
                  </p>
                  <p className="mt-3 font-display text-lg italic leading-snug">
                    &ldquo;{p.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <Container className="relative overflow-hidden rounded-3xl border-2 border-brand-100 bg-white px-6 py-16 text-center sm:px-16">
            <DoodleField />
            <div className="relative">
              <SectionHeading
                align="center"
                eyebrow="Ready when you are"
                title="Your first entry is one click away"
                description="Free forever. No credit card, no pressure — just a fresh prompt and a private page."
              />
              <div className="mt-8 flex justify-center gap-4">
                <ButtonLink href="/signup">Start journaling — it&apos;s free</ButtonLink>
                <ButtonLink href="/login" variant="outline">
                  Log in
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <JournalLockGate>
      <JournalFeed firstName={user.name.split(" ")[0]} />
    </JournalLockGate>
  );
}
