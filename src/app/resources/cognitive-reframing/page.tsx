import type { Metadata } from "next";
import { Brain, Users } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import ReframingTool from "./reframing-tool";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Cognitive Reframing",
  description:
    "A guided CBT exercise for catching thinking traps and reframing automatic negative thoughts — with a shuffling bank of everyday scenarios.",
};

export default async function CognitiveReframingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).reframingTool;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{t.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Brain className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-brand-900">
                {t.whatIsAutomaticThoughtTitle}
              </p>
              <p className="mt-1.5 text-sm text-ink/65">{t.whatIsAutomaticThoughtBody}</p>
            </div>
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Users className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-brand-900">{t.notAloneTitle}</p>
              <p className="mt-1.5 text-sm text-ink/65">{t.notAloneBody}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <ReframingTool dict={t} locale={locale} />
        </Container>
      </section>
    </>
  );
}
