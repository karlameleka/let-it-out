import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { FaqList } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import CounselorFinder from "./counselor-finder";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";

export const metadata: Metadata = {
  title: "Counseling",
  description:
    "One-on-one online counseling sessions with specialized psychotherapists, using CBT, ACT, and DBT frameworks.",
};

export default async function CounselingPage() {
  const [locale, overrides] = await Promise.all([
    getLocale(),
    getSiteTextOverrides(),
  ]);
  const baseDict = getDictionary(locale);
  const t = applyOverrides(baseDict.counseling, "counseling", overrides, locale);
  const dict = { ...baseDict, counseling: t };

  const counselorRows = await prisma.counselor.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  // Arabic display fields fall back to English whenever untranslated; the
  // English specialties/languages arrays stay untouched (unrenamed) below
  // since counselorMatchesSearch matches against the canonical English tags.
  const counselors = counselorRows.map((c) => ({
    ...c,
    displayName: locale === "ar" && c.nameAr ? c.nameAr : c.name,
    displayCredentials: locale === "ar" && c.credentialsAr ? c.credentialsAr : c.credentials,
    displaySpecialties: locale === "ar" && c.specialtiesAr.length > 0 ? c.specialtiesAr : c.specialties,
    displayLanguages: locale === "ar" && c.languagesAr.length > 0 ? c.languagesAr : c.languages,
  }));

  const COUNSELING_FAQ = [
    { question: t.faq1Q, answer: t.faq1A },
    { question: t.faq2Q, answer: t.faq2A },
    { question: t.faq3Q, answer: t.faq3A },
    { question: t.faq4Q, answer: t.faq4A },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-6 sm:pt-14 sm:pb-10">
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

      <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
        <Reveal>
          <Container>
            <SectionHeading
              eyebrow={t.chooseEyebrow}
              title={t.chooseTitle}
              description={t.chooseDescription}
            />
            <div className="mt-8">
              <CounselorFinder counselors={counselors} dict={dict} locale={locale} />
            </div>
          </Container>
        </Reveal>
      </section>

      <section id="faq" className="bg-brand-50 py-16 sm:py-20">
        <Reveal>
          <Container className="max-w-2xl">
            <SectionHeading eyebrow={t.faqEyebrow} title={t.faqTitle} />
            <div className="mt-8">
              <FaqList items={COUNSELING_FAQ} />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
