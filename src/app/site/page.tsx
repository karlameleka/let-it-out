import type { Metadata } from "next";
import Image from "next/image";
import { Download, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, WaveDivider, DoodleField } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import InstallPreview, { PhoneFrame } from "@/components/install-preview";
import { getDictionary } from "@/lib/i18n/dictionary";

const APP_ORIGIN = "https://www.letitouteg.org";
// This page is deliberately English-only marketing copy (no locale
// switcher here) — InstallPreview needs a dict for its phone-preview
// mock content, so it gets the "en" one directly.
const installDict = getDictionary("en").install;

export const metadata: Metadata = {
  title: { absolute: "Let It Out | Mental Health Services, Egypt" },
  description:
    "Psychologist-led mental health support — online counseling, guided journals, and workplace workshops. Download the Let It Out app to get started.",
};

// Short, on-surface highlights rather than full service descriptions —
// this page's only job is to get someone to download the app, not to
// stand in for it. See proxy.ts and PR notes: nothing here links into
// the live app itself, only to the install flow.
const HIGHLIGHTS = [
  { icon: Users, text: "Confidential 1:1 counseling" },
  { icon: Sparkles, text: "Daily guided journaling" },
  { icon: ShieldCheck, text: "Private, works offline" },
];

const TRUST_LOGOS = [
  { name: "e&", src: "/brand/trusted-by/e-and.png", width: 102, height: 96 },
  { name: "Nestlé", src: "/brand/trusted-by/nestle.png", width: 640, height: 176 },
  {
    name: "The American University in Cairo",
    src: "/brand/trusted-by/american-university-cairo.png",
    width: 401,
    height: 75,
  },
  {
    name: "The British University in Egypt",
    src: "/brand/trusted-by/british-university-egypt.png",
    width: 425,
    height: 152,
  },
  {
    name: "Bibliotheca Alexandrina",
    src: "/brand/trusted-by/bibliotheca-alexandrina.png",
    width: 220,
    height: 93,
  },
  { name: "Fahim Foundation", src: "/brand/trusted-by/fahim-foundation.png", width: 349, height: 89 },
];

function DownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={`${APP_ORIGIN}/install`}
      className={`inline-flex items-center justify-center gap-2 rounded bg-brand-700 px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] ${className}`}
    >
      <Download className="h-4 w-4" strokeWidth={2} />
      Download the app
    </a>
  );
}

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative py-10 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="text-center lg:text-left">
              <Ribbon>Psychologist-led · Est. 2021</Ribbon>
              <h1 className="animate-rise mx-auto mt-6 max-w-xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl lg:mx-0" style={{ animationDelay: "0.08s" }}>
                A self-exploration journey, right in your pocket.
              </h1>
              <p className="animate-rise mx-auto mt-6 max-w-md text-lg text-ink/70 lg:mx-0" style={{ animationDelay: "0.18s" }}>
                Counseling, guided journals, and workshops — one app, one download away.
              </p>
              <div className="animate-rise mt-9 flex justify-center lg:justify-start" style={{ animationDelay: "0.28s" }}>
                <DownloadButton />
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-xs justify-center py-4 lg:max-w-none">
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/60 sm:h-80 sm:w-80" />
              <div className="relative -rotate-3">
                <PhoneFrame label="Your daily journal">
                  <div className="bg-brand-50 px-4 pb-4 pt-8">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">Self-exploration</p>
                    <p className="mt-1 font-display text-base font-medium text-brand-900">Hi, welcome back</p>
                    <div className="mt-3 flex gap-2">
                      <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
                        <p className="font-display text-sm font-semibold leading-none text-brand-900">12</p>
                        <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">Day streak</p>
                      </div>
                      <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
                        <p className="font-display text-sm font-semibold leading-none text-brand-900">34</p>
                        <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">Entries</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 px-4 py-3">
                    {[
                      { date: "12 Aug", mood: "#8bc4d1" },
                      { date: "11 Aug", mood: "#3388a4" },
                      { date: "10 Aug", mood: "#1e5b73" },
                    ].map((e) => (
                      <div key={e.date} className="flex items-center gap-1.5 rounded-lg border border-brand-100 bg-white p-2.5">
                        <span className="text-[7px] text-ink/40">{e.date}</span>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.mood }} />
                        <span className="h-1.5 flex-1 rounded-full bg-brand-50" />
                      </div>
                    ))}
                  </div>
                </PhoneFrame>
              </div>
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
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 text-sm font-medium text-ink/70">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
                  {text}
                </span>
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Trusted by */}
      <section className="border-y border-brand-100 py-10">
        <Reveal>
          <Container>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
              Trusted by teams and organizations including
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-8">
              {TRUST_LOGOS.map((logo) => (
                <Image
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-6 w-auto object-contain opacity-90 transition hover:opacity-100 sm:h-7"
                />
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-brand-50 pb-20 pt-16 sm:pt-20">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Get the app"
              title="Ready to start your journey?"
              description="Install the app for one-tap access to your journal, sessions, and resources — no browser bar, no app store needed."
            />

            <div className="mt-12">
              <InstallPreview dict={installDict} />
            </div>

            <div className="mt-10 flex justify-center">
              <DownloadButton />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
