import type { Metadata } from "next";
import Image from "next/image";
import { Download, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Container, SectionHeading, Eyebrow } from "@/components/ui";
import { Ribbon, WaveDivider, DoodleField, Swash } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import InstallPreview from "@/components/install-preview";
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

const SERVICES = [
  {
    index: "01",
    title: "Individual Online Counseling",
    description:
      "One-on-one sessions with specialized psychotherapists using CBT, ACT, and DBT frameworks, personalized to you.",
    cta: "See counselor profiles",
    href: `${APP_ORIGIN}/counseling`,
  },
  {
    index: "02",
    title: "Trainings and Workshops",
    description:
      "Interactive, evidence-based sessions designed to enhance employee wellbeing — from stress-management to mental health first-aid.",
    cta: "See workshop topics",
    href: `${APP_ORIGIN}/workshops`,
  },
  {
    index: "03",
    title: "Guided Journals & Digital Resources",
    description:
      "Practical, CBT-informed self-help journals to help you build a healthier relationship with yourself and others.",
    cta: "Browse journals",
    href: `${APP_ORIGIN}/shop`,
  },
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

const APP_HIGHLIGHTS = [
  { icon: Sparkles, text: "Daily guided journaling prompts" },
  { icon: Users, text: "Book & manage counseling sessions" },
  { icon: ShieldCheck, text: "Private, works offline, no app store needed" },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative pt-8 pb-14 text-center sm:pt-20 sm:pb-28">
          <div className="mx-auto max-w-2xl">
            <Ribbon>Psychologist-led · Est. 2021</Ribbon>
            <h1 className="animate-rise mx-auto mt-6 max-w-xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl" style={{ animationDelay: "0.08s" }}>
              A <span className="mark-swash italic text-brand-700">self-exploration<Swash /></span> journey, with you every step of the way.
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-lg text-lg text-ink/70" style={{ animationDelay: "0.18s" }}>
              Let It Out enhances wellbeing through evidence-based research, practical tools, and compassionate care — one-on-one counseling, guided journals, and workshops, all in one app.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4" style={{ animationDelay: "0.28s" }}>
              <a
                href={`${APP_ORIGIN}/install`}
                className="inline-flex items-center justify-center gap-2 rounded bg-brand-700 px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Download the app
              </a>
              <a href="#services" className="!rounded-none !px-0 !py-0 font-semibold text-ink link-grow">
                Explore our services &rarr;
              </a>
            </div>
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {/* Trusted by */}
      <section className="border-b border-brand-100 pt-4 pb-10 sm:py-10">
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

      {/* Services */}
      <section id="services" className="relative overflow-hidden bg-brand-50 pb-24 pt-16 scroll-mt-16 sm:pt-20">
        <Reveal>
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Our services"
              title="Support that meets you where you are"
              description="Three ways to work with us — whichever fits your life right now."
            />
            <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-3">
              {SERVICES.map((service, i) => (
                <a
                  key={service.title}
                  href={service.href}
                  className={`group relative flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-7 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900 ${i === 1 ? "sm:mt-8" : ""}`}
                >
                  <span className="font-display text-4xl font-semibold text-brand-100 transition-colors duration-300 group-hover:text-white/10 group-active:text-white/10">
                    {service.index}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                    {service.description}
                  </p>
                  <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                    {service.cta} &rarr;
                  </p>
                </a>
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Get the App */}
      <section id="app" className="relative overflow-hidden bg-white pb-20 pt-16 scroll-mt-16 sm:pt-20">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-white" />
        <Reveal>
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Get the app"
              title="Let It Out, right on your home screen."
              description="Install the app for one-tap access to your journal, sessions, and resources — no browser bar, no app store needed."
            />

            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {APP_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 text-sm text-ink/70">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
                  {text}
                </span>
              ))}
            </div>

            <div className="mt-12">
              <InstallPreview dict={installDict} />
            </div>

            <div className="mt-10 flex justify-center">
              <a
                href={`${APP_ORIGIN}/install`}
                className="inline-flex items-center justify-center gap-2 rounded bg-brand-700 px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Download the app
              </a>
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Story */}
      <section className="relative overflow-hidden bg-brand-50 pb-20 pt-16 sm:pt-20">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
          <Container className="max-w-2xl text-center">
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-medium leading-[1.15] text-brand-900 sm:text-4xl">
              Founded to make quality mental health care reachable.
            </h2>
            <p className="mt-4 text-base text-ink/70">
              Founded by Egyptian psychologist Karla Meleka, Let It Out delivers professional mental health support tailored to your community&apos;s needs, reducing stigma, one mind at a time.
            </p>
            <a href={`${APP_ORIGIN}/about`} className="mt-6 inline-block !rounded-none !px-0 !py-0 font-semibold text-ink link-grow">
              Read our story &rarr;
            </a>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
