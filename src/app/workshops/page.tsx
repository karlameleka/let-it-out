import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { getWorkshopTopics } from "@/lib/content/workshops";
import { Ribbon, Swash, WaveDivider, DoodleField } from "@/components/decor";
import WorkshopInquiryForm from "./inquiry-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Trainings and Workshops",
  description:
    "Interactive, evidence-based workshops designed to enhance wellbeing for employees, teams, students, and parents.",
};

export default async function WorkshopsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.workshops;
  const topics = getWorkshopTopics(locale);

  const pastSessions = [t.pastSession1, t.pastSession2, t.pastSession3, t.pastSession4];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20">
        <DoodleField />
        <Container className="relative">
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
            {t.titlePrefix}
            <span className="mark-swash italic text-brand-700">
              {t.titleHighlight}<Swash />
            </span>
            {t.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">{t.description}</p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-16 pt-4 sm:pb-20">
        <Container>
          <SectionHeading eyebrow={t.topicsEyebrow} title={t.topicsTitle} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <div
                key={topic.slug}
                className="group rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
              >
                <span className="font-display text-2xl font-semibold text-brand-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-brand-900">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{topic.description}</p>
                {topic.stat && (
                  <div className="mt-4 rounded-xl bg-brand-50 p-3">
                    <p className="text-xs font-medium leading-snug text-brand-800">{topic.stat}</p>
                    {topic.statSource && (
                      <p className="mt-1 text-[11px] text-ink/40">
                        {t.statSourceLabel}: {topic.statSource}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20" id="request-quote">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Container className="grid gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={t.workTogetherEyebrow}
              title={t.requestTitle}
              description={t.requestDescription}
            />
            <div className="mt-6 space-y-3 text-sm text-ink/70">
              <p className="font-semibold text-brand-800">{t.pastSessionsLabel}</p>
              <ul className="space-y-1.5">
                {pastSessions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <WorkshopInquiryForm topics={topics} dict={dict} />
        </Container>
      </section>
    </>
  );
}
