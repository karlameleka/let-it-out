import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Let It Out's services.",
};

const LAST_UPDATED = "August 14, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/75">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).termsPage;

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
            <p>
              {t.s1Prefix}{" "}
              <a href="/privacy" className="font-medium text-brand-600 underline">
                {t.s1LinkText}
              </a>
              {t.s1Suffix}
            </p>
          </Section>

          <Section title={t.s2Title}>
            <p>{t.s2Body}</p>
          </Section>

          <Section title={t.s3Title}>
            <p>{t.s3Body}</p>
          </Section>

          <Section title={t.s4Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s4Item1}</li>
              <li>{t.s4Item2}</li>
              <li>{t.s4Item3}</li>
              <li>{t.s4Item4}</li>
            </ul>
          </Section>

          <Section title={t.s5Title}>
            <p>{t.s5Body}</p>
          </Section>

          <Section title={t.s6Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s6Item1}</li>
              <li>{t.s6Item2}</li>
              <li>{t.s6Item3}</li>
              <li>{t.s6Item4}</li>
              <li>{t.s6Item5}</li>
              <li>{t.s6Item6}</li>
            </ul>
          </Section>

          <Section title={t.s7Title}>
            <p>
              {t.s7Prefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>{" "}
              {t.s7Suffix}
            </p>
          </Section>

          <Section title={t.s8Title}>
            <p>{t.s8Body}</p>
          </Section>

          <Section title={t.s9Title}>
            <p>{t.s9Body}</p>
          </Section>

          <Section title={t.s10Title}>
            <p>{t.s10Body}</p>
          </Section>

          <Section title={t.s11Title}>
            <p>{t.s11Body}</p>
          </Section>

          <Section title={t.s12Title}>
            <p>{t.s12Body}</p>
          </Section>

          <Section title={t.s13Title}>
            <p>{t.s13Body}</p>
          </Section>

          <Section title={t.s14Title}>
            <p>
              {t.s14Prefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>{" "}
              {t.s14Middle}{" "}
              <a href="/contact" className="font-medium text-brand-600 underline">
                {t.contactPageLink}
              </a>
              {t.s14Suffix}
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
