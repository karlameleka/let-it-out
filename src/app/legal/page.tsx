import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Legal" };

export default async function LegalPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.legal;
  const f = dict.footer;

  const LINKS = [
    { href: "/privacy", label: f.privacyPolicy },
    { href: "/terms", label: f.terms },
    { href: "/legal/data-processing", label: dict.dataProcessingPage.title },
    { href: "/legal/telehealth-consent", label: dict.telehealthConsentPage.title },
    { href: "/legal/terms-of-care", label: dict.termsOfCarePage.title },
    { href: "/shop-policy", label: f.shopPolicy },
  ];

  return (
    <Container className="max-w-xl pt-6 pb-10 sm:pt-14 sm:pb-20">
      <Eyebrow>{t.title}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.subtitle}</p>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white">
        {LINKS.map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-5 py-4 text-base font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50 ${
              i > 0 ? "border-t border-brand-100" : ""
            }`}
          >
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink/30" strokeWidth={2} />
          </Link>
        ))}
      </div>
    </Container>
  );
}
