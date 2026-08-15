import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { FaqList } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import CounselorFinder from "./counselor-finder";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Counseling",
  description:
    "One-on-one online counseling sessions with specialized psychotherapists, using CBT, ACT, and DBT frameworks.",
};

export default async function CounselingPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.counseling;

  const counselors = await prisma.counselor.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const COUNSELING_FAQ = [
    { question: t.faq1Q, answer: t.faq1A },
    { question: t.faq2Q, answer: t.faq2A },
    { question: t.faq3Q, answer: t.faq3A },
    { question: t.faq4Q, answer: t.faq4A },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20">
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
            <SectionHeading
              eyebrow={t.chooseEyebrow}
              title={t.chooseTitle}
              description={t.chooseDescription}
            />
            <CounselorFinder counselors={counselors} dict={dict} />
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
