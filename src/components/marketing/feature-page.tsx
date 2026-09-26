import { Container, SectionHeading, Eyebrow } from "@/components/ui";
import { WaveDivider, DoodleField } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import { DownloadButton } from "@/components/marketing/download-button";
import type { LucideIcon } from "lucide-react";

/** Shared template for the marketing site's per-tool pages (counseling,
 * journaling, workshops, ...): hero + a phone mockup + a short highlight
 * list + a closing download banner. Every one of these pages exists to
 * get someone to download the app, not to stand in for it — see
 * proxy.ts and the PR notes for why nothing here links into the live app. */
export function FeaturePage({
  eyebrow,
  title,
  description,
  highlights,
  phone,
  closingTitle,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: { icon: LucideIcon; text: string }[];
  phone: React.ReactNode;
  closingTitle: string;
}) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative py-10 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="text-center lg:text-left">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="animate-rise mx-auto mt-4 max-w-xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl lg:mx-0" style={{ animationDelay: "0.08s" }}>
                {title}
              </h1>
              <p className="animate-rise mx-auto mt-6 max-w-md text-lg text-ink/70 lg:mx-0" style={{ animationDelay: "0.18s" }}>
                {description}
              </p>
              <div className="animate-rise mt-9 flex justify-center lg:justify-start" style={{ animationDelay: "0.28s" }}>
                <DownloadButton />
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-xs justify-center py-4 lg:max-w-none">
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/60 sm:h-80 sm:w-80" />
              <div className="relative -rotate-3">{phone}</div>
            </div>
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {/* Highlights */}
      <section className="pt-4 pb-10 sm:py-10">
        <Reveal>
          <Container>
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 text-sm font-medium text-ink/70">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
                  {text}
                </span>
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-brand-50 pb-20 pt-16 sm:pt-20">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
          <Container className="max-w-xl text-center">
            <SectionHeading align="center" eyebrow="Get the app" title={closingTitle} />
            <div className="mt-9 flex justify-center">
              <DownloadButton />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
