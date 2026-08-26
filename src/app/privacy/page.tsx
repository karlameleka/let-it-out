import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Let It Out collects, protects, and handles your personal and mental health data.",
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

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).privacyPolicy;

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
          <div className="rounded-2xl border-2 border-brand-100 bg-brand-50/60 p-6">
            <p className="text-sm font-semibold text-brand-800">{t.commitmentLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{t.commitmentBody}</p>
          </div>

          <Section title={t.s1Title}>
            <p>{t.s1Body}</p>
          </Section>

          <Section title={t.s2Title}>
            <p>{t.s2Intro}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>{t.s2Item1Label}</strong> {t.s2Item1Text}
              </li>
              <li>
                <strong>{t.s2Item2Label}</strong> {t.s2Item2Text}
              </li>
              <li>
                <strong>{t.s2Item3Label}</strong> {t.s2Item3Text}
              </li>
              <li>
                <strong>{t.s2Item4Label}</strong> {t.s2Item4Text}
              </li>
              <li>
                <strong>{t.s2Item5Label}</strong> {t.s2Item5Text}
              </li>
              <li>
                <strong>{t.s2Item6Label}</strong> {t.s2Item6Text}
              </li>
              <li>
                <strong>{t.s2Item7Label}</strong> {t.s2Item7Text}
              </li>
            </ul>
          </Section>

          <Section title={t.s3Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s3Item1}</li>
              <li>{t.s3Item2}</li>
              <li>{t.s3Item3}</li>
              <li>{t.s3Item4}</li>
              <li>{t.s3Item5}</li>
              <li>{t.s3Item6}</li>
              <li>{t.s3Item7}</li>
            </ul>
            <p>{t.s3Outro}</p>
          </Section>

          <Section title={t.s4Title}>
            <p>{t.s4Body}</p>
          </Section>

          <Section title={t.s5Title}>
            <p>{t.s5P1}</p>
            <p>{t.s5P2}</p>
          </Section>

          <Section title={t.s6Title}>
            <p>{t.s6Body}</p>
          </Section>

          <Section title={t.s7Title}>
            <p>{t.s7Body}</p>
          </Section>

          <Section title={t.s8Title}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s8Item1}</li>
              <li>{t.s8Item2}</li>
              <li>{t.s8Item3}</li>
              <li>{t.s8Item4}</li>
            </ul>
          </Section>

          <Section title={t.s9Title}>
            <p>{t.s9Intro}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.s9Item1}</li>
              <li>{t.s9Item2}</li>
              <li>{t.s9Item3}</li>
              <li>{t.s9Item4}</li>
              <li>{t.s9Item5}</li>
            </ul>
            <p>
              {t.s9OutroPrefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>
              {t.s9OutroSuffix}
            </p>
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
            <p>
              {t.s13Prefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>{" "}
              {t.s13Middle}{" "}
              <a href="/contact" className="font-medium text-brand-600 underline">
                {t.contactPageLink}
              </a>
              {t.s13Suffix}
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
