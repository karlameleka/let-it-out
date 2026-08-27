import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import NextStepTool from "../next-step-tool";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Tiny Next Step",
  description: "A behavioral activation exercise for when something feels stuck — shrink it to one tiny step.",
};

export default async function NextStepPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).nextStepTool;

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
          <NextStepTool dict={t} />
        </Container>
      </section>
    </>
  );
}
