import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash } from "@/components/decor";
import { FaqList } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import CounselorFinder from "./counselor-finder";
import MarkCounselingExplored from "./mark-explored";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Counseling",
  description:
    "One-on-one online counseling sessions with specialized psychotherapists, using CBT, ACT, and DBT frameworks.",
};

export default async function CounselingPage() {
  const [locale, overrides, user] = await Promise.all([
    getLocale(),
    getSiteTextOverrides(),
    getCurrentUser(),
  ]);
  const baseDict = getDictionary(locale);
  const t = applyOverrides(baseDict.counseling, "counseling", overrides, locale);
  const dict = { ...baseDict, counseling: t };

  // A narrow `select` (rather than fetching every column) matters here more
  // than usual: this page hands the whole row to a "use client" component
  // as props, which get serialized into the page's RSC payload — the full
  // row would otherwise ship passwordHash/resetTokenHash/loginTokenHash
  // (therapist portal login credentials) to every visitor's browser.
  const [counselorRows, filters] = await Promise.all([
    prisma.counselor.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        credentials: true,
        specialties: true,
        languages: true,
        nameAr: true,
        credentialsAr: true,
        specialtiesAr: true,
        languagesAr: true,
        photoUrl: true,
        availabilityStatus: true,
        filters: { select: { filterId: true } },
      },
    }),
    prisma.counselorFilter.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, label: true, labelAr: true },
    }),
  ]);

  // Arabic display fields fall back to English whenever untranslated; the
  // English specialties/languages arrays stay untouched (unrenamed) below
  // since counselorMatchesSearch matches against the canonical English tags.
  const counselors = counselorRows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    credentials: c.credentials,
    specialties: c.specialties,
    languages: c.languages,
    photoUrl: c.photoUrl,
    availabilityStatus: c.availabilityStatus,
    filterIds: c.filters.map((f) => f.filterId),
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
      <section
        className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 pt-6 pb-10 text-white sm:pt-14 sm:pb-16"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 94%, 0 100%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-white/10" />
        <Container className="relative">
          <Ribbon tone="dark">{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
            {t.titlePrefix}
            <span className="mark-swash italic text-brand-200">
              {t.titleHighlight}<Swash />
            </span>
            {t.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-50/85">{t.description}</p>
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
            <div className="mt-8" data-onboarding="counseling-list">
              <CounselorFinder counselors={counselors} filters={filters} dict={dict} locale={locale} />
            </div>
            {user && <MarkCounselingExplored />}
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
