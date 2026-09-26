import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import GratitudeTool from "../gratitude-tool";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Gratitude Pause",
  description: "A short gratitude check-in to notice a few good things and reset your mood.",
};

export default async function GratitudePage() {
  const locale = await getLocale();
  const t = getDictionary(locale).gratitudeTool;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Link
            href="/resources/cbt-exercises"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow"
          >
            <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToCbt}
          </Link>
          <div className="mt-4">
            <Ribbon>{t.ribbon}</Ribbon>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{t.description}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <GratitudeTool dict={t} />
        </Container>
      </section>
    </>
  );
}
