import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Terms of Care",
  description: "What to expect from the counseling relationship at Let It Out.",
};

const LAST_UPDATED = "September 19, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/75">{children}</div>
    </section>
  );
}

export default async function TermsOfCarePage() {
  const locale = await getLocale();
  const t = getDictionary(locale).termsOfCarePage;

  return (
    <>
      <section className="bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <Container>
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">{t.description}</p>
          <p className="mt-3 text-sm text-ink/50">
            {t.lastUpdatedLabel} {LAST_UPDATED}
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="rounded-2xl border-2 border-red-100 bg-red-50/60 p-6">
            <p className="text-sm font-semibold text-red-800">{t.crisisLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              {t.crisisBodyPrefix}{" "}
              <a href="tel:16328" className="font-semibold text-red-700 underline">
                16328
              </a>{" "}
              {t.crisisBodySuffix}
            </p>
          </div>

          <Section title={t.s1Title}>
            <p>{t.s1Body}</p>
          </Section>

          <Section title={t.s2Title}>
            <p>{t.s2Body}</p>
          </Section>

          <Section title={t.s3Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s3Item1}</li>
              <li>{t.s3Item2}</li>
              <li>{t.s3Item3}</li>
            </ul>
          </Section>

          <Section title={t.s4Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s4Item1}</li>
              <li>{t.s4Item2}</li>
              <li>{t.s4Item3}</li>
            </ul>
          </Section>

          <Section title={t.s5Title}>
            <p>{t.s5Body}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s5Item1}</li>
              <li>{t.s5Item2}</li>
              <li>{t.s5Item3}</li>
            </ul>
          </Section>

          <Section title={t.s6Title}>
            <p>{t.s6Body}</p>
          </Section>

          <Section title={t.s7Title}>
            <p>{t.s7Body}</p>
          </Section>

          <Section title={t.s8Title}>
            <p>
              {t.s8Prefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>
              {t.s8Suffix}
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
