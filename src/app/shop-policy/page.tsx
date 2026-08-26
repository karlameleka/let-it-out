import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Shop Policy",
  description: "Delivery, shipping, refund, and cancellation policy for Let It Out guided journals.",
};

const LAST_UPDATED = "August 23, 2026";

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

export default async function ShopPolicyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).shopPolicyPage;

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
          <Section title={t.deliveryTitle}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t.deliveryItem1}</li>
              <li>{t.deliveryItem2}</li>
              <li>{t.deliveryItem3}</li>
              <li>{t.deliveryItem4}</li>
              <li>{t.deliveryItem5}</li>
              <li>{t.deliveryItem6}</li>
            </ul>
          </Section>

          <Section title={t.refundTitle}>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>{t.refundItem1Label}</strong> {t.refundItem1TextPrefix}{" "}
                <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                  letitoutsupport@gmail.com
                </a>
                {t.refundItem1TextSuffix}
              </li>
              <li>
                <strong>{t.refundItem2Label}</strong> {t.refundItem2Text}
              </li>
              <li>
                <strong>{t.refundItem3Label}</strong> {t.refundItem3Text}
              </li>
              <li>
                <strong>{t.refundItem4Label}</strong> {t.refundItem4Text}
              </li>
              <li>
                <strong>{t.refundItem5Label}</strong> {t.refundItem5Text}
              </li>
            </ul>
          </Section>

          <Section title={t.questionsTitle}>
            <p>
              {t.questionsPrefix}{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>
              , {t.questionsCallLabel}{" "}
              <a href="tel:+201288200533" className="font-medium text-brand-600 underline">
                +20 128 8200533
              </a>
              , {t.questionsMiddle}{" "}
              <a href="/contact" className="font-medium text-brand-600 underline">
                {t.contactPageLink}
              </a>
              {t.questionsSuffix1}{" "}
              <a href="/terms" className="font-medium text-brand-600 underline">
                {t.termsLinkText}
              </a>
              {t.questionsSuffix2}
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
