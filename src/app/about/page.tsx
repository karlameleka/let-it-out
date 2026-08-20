import type { Metadata } from "next";
import Image from "next/image";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, Swash } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Let It Out's story, mission, and vision since 2021.",
};

export default async function AboutPage() {
  const t = getDictionary(await getLocale()).about;

  const values = [
    { label: t.value1Label, description: t.value1Text },
    { label: t.value2Label, description: t.value2Text },
    { label: t.value3Label, description: t.value3Text },
    { label: t.value4Label, description: t.value4Text },
  ];

  const trustedByLogos = [
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
    {
      name: "Ministry of Youth and Sports",
      src: "/brand/trusted-by/ministry-of-youth-and-sports.png",
      width: 203,
      height: 203,
    },
    { name: "St. Fatima", src: "/brand/trusted-by/st-fatima.png", width: 218, height: 135 },
    {
      name: "Smash Sporting Club",
      src: "/brand/trusted-by/smash-sporting-club.png",
      width: 466,
      height: 116,
    },
    {
      name: "Haya Karima Foundation",
      src: "/brand/trusted-by/haya-karima-foundation.png",
      width: 132,
      height: 165,
    },
  ];

  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            {t.titlePrefix}
            <span className="mark-swash italic text-brand-700">
              {t.titleHighlight}<Swash />
            </span>
            {t.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">{t.intro}</p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="border-b border-brand-100 pt-4 pb-10 sm:py-10">
        <Reveal>
          <Container>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
              {t.trustedByLabel}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-8">
              {trustedByLogos.map((logo) => (
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

      <section className="pb-16 pt-16 sm:pb-20">
        <Reveal>
          <Container className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-8 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-brand-900">
                {t.visionTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-500">
                {t.visionLabel}
              </p>
              <p className="mt-4 text-ink/70">{t.visionText}</p>
            </div>
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-8 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-brand-900">
                {t.missionTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-500">
                {t.missionLabel}
              </p>
              <p className="mt-4 text-ink/70">{t.missionText}</p>
            </div>
          </Container>
        </Reveal>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <Reveal>
          <Container className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <SectionHeading eyebrow={t.valuesEyebrow} title={t.valuesTitle} />
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {values.map((value) => (
                  <div key={value.label} className="border-l-2 border-brand-300 pl-4">
                    <p className="font-display text-lg font-semibold text-brand-900">{value.label}</p>
                    <p className="mt-1.5 text-sm text-ink/70">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Logo variant="icon-teal" height={200} className="drop-shadow-md" />
            </div>
          </Container>
        </Reveal>
      </section>

      <section className="py-16 sm:py-20">
        <Reveal>
          <Container>
            <SectionHeading
              eyebrow={t.communityEyebrow}
              title={t.communityTitle}
              description={t.communityDescription}
            />
          </Container>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-brand-800 py-16 text-white sm:py-20">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-800" />
        <Reveal>
          <Container className="text-center">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.ctaTitle}</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/counseling" variant="bright">
                {t.ctaBook}
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline-inverse">
                {t.ctaContact}
              </ButtonLink>
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
