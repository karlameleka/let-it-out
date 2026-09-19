import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import HelpCenterFilter from "./help-center-filter";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Search frequently asked questions about counseling, the shop, workshops, resources, and technical support.",
};

export default async function HelpCenterPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.helpCenter;

  return (
    <Container className="max-w-2xl pt-6 pb-10 sm:pt-14 sm:pb-20">
      <Eyebrow>{t.title}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.subtitle}</p>

      <HelpCenterFilter faqs={t.faqs} dict={t} />

      <div className="mt-10 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.contactTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.contactDescription}</p>
        <div className="mt-4">
          <Link
            href="/support"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            {t.contactCta}
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.feedbackTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.feedbackDescription}</p>
        <div className="mt-4">
          <Link
            href="/feedback"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Star className="h-4 w-4" strokeWidth={2} />
            {t.feedbackCta}
          </Link>
        </div>
      </div>
    </Container>
  );
}
