import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Individual online counseling, trainings & workshops, and guided journals from Let It Out.",
};

export default async function ServicesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.services;
  const home = dict.home;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative">
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            {t.titlePrefix}
            <span className="mark-swash italic text-brand-700">
              {t.titleHighlight}<Swash />
            </span>
            {t.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">{t.description}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Reveal>
          <Container>
            <div className="grid gap-6 sm:grid-cols-3">
              <Link
                href="/counseling"
                className="group relative flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-8 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
              >
                <span className="font-display text-4xl font-semibold text-brand-100 transition-colors duration-300 group-hover:text-white/10 group-active:text-white/10">
                  01
                </span>
                <h2 className="mt-3 font-display text-xl font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service1Title}
                </h2>
                <p className="mt-3 flex-1 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                  {home.service1Description}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service1Cta} &rarr;
                </p>
              </Link>

              <Link
                href="/workshops"
                className="group relative flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-8 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
              >
                <span className="font-display text-4xl font-semibold text-brand-100 transition-colors duration-300 group-hover:text-white/10 group-active:text-white/10">
                  02
                </span>
                <h2 className="mt-3 font-display text-xl font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service2Title}
                </h2>
                <p className="mt-3 flex-1 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                  {home.service2Description}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service2Cta} &rarr;
                </p>
              </Link>

              <Link
                href="/shop"
                className="group relative flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-8 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
              >
                <span className="font-display text-4xl font-semibold text-brand-100 transition-colors duration-300 group-hover:text-white/10 group-active:text-white/10">
                  03
                </span>
                <h2 className="mt-3 font-display text-xl font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service3Title}
                </h2>
                <p className="mt-3 flex-1 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                  {home.service3Description}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {home.service3Cta} &rarr;
                </p>
              </Link>
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
