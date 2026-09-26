import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { getWorkshopTopics } from "@/lib/content/workshops";
import { Ribbon, Swash, WaveDivider, DoodleField } from "@/components/decor";
import WorkshopInquiryForm from "./inquiry-form";
import WorkshopNotifySection from "./workshop-notify-section";
import { Reveal } from "@/components/reveal";
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
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ButtonLink href="#request-quote" variant="primary">
              {t.heroInquiryCta}
            </ButtonLink>
            <ButtonLink
              href="/downloads/let-it-out-workshops-catalogue.pdf"
              download
              variant="outline"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              {t.catalogueCta}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-16 pt-4 sm:pb-20">
        <Reveal>
        <Container>
          <SectionHeading eyebrow={t.topicsEyebrow} title={t.topicsTitle} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <div
                key={topic.slug}
                className="group rounded-2xl border-[1.5px] border-brand-900 bg-white p-6 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
              >
                <span className="font-display text-2xl font-semibold text-brand-200 transition-colors duration-300 group-hover:text-white/15 group-active:text-white/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{topic.description}</p>
                {topic.stat && (
                  <div className="mt-4 rounded-xl bg-brand-50 p-3 transition-colors duration-300 group-hover:bg-white/10 group-active:bg-white/10">
                    <p className="text-xs font-medium leading-snug text-brand-800 transition-colors duration-300 group-hover:text-white group-active:text-white">{topic.stat}</p>
                    {topic.statSource && (
                      <p className="mt-1 text-[11px] text-ink/40 transition-colors duration-300 group-hover:text-white/40 group-active:text-white/40">
                        {t.statSourceLabel}: {topic.statSource}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20" id="request-quote">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
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
        </Reveal>
      </section>

      <WorkshopNotifySection dict={dict.workshopNotify} />

      <Link
        href="#request-quote"
        className="fixed bottom-24 start-5 z-40 hidden rounded-full border-2 border-brand-900 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-lg transition-all duration-300 ease-out hover:bg-brand-900 active:bg-brand-900 hover:text-white active:text-white hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] sm:inline-flex sm:items-center md:bottom-5"
      >
        {t.heroInquiryCta} &darr;
      </Link>
    </>
  );
}
