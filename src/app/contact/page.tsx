import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { SOCIAL_LINKS } from "@/components/social-icons";
import ContactForm from "./contact-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

const OFFICE_MAPS_URL = "https://maps.app.goo.gl/ym5Dc5zvyxfPVxcZA";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Let It Out.",
};

export default async function ContactPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.contact;
  const f = dict.footer;

  return (
    <section className="pt-6 pb-10 sm:pt-14 sm:pb-24">
      <Container className="mx-auto max-w-2xl">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 text-sm text-ink/70">
          <p>
            {t.counselingHint}{" "}
            <Link href="/counseling" className="font-medium text-brand-600 hover:underline active:underline">
              {t.counselingLink}
            </Link>
            .
          </p>
          <p className="mt-2">
            {t.workshopsHint}{" "}
            <Link href="/workshops" className="font-medium text-brand-600 hover:underline active:underline">
              {t.workshopsLink}
            </Link>
            .
          </p>
        </div>

        <div className="mt-8">
          <ContactForm dict={dict} />
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
          <a
            href={OFFICE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-brand-700 active:text-brand-700"
          >
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
            {f.officeLocation}
          </a>

          <div className="mt-4 flex flex-wrap gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 text-brand-600 transition-colors hover:border-brand-400 hover:bg-brand-50 active:border-brand-400 active:bg-brand-50"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <p className="mt-5 text-xs text-ink/50">{f.crisisNotice}</p>
          <p className="mt-1 text-sm text-ink/70">
            {f.crisisHotlineLabel}{" "}
            <a href="tel:16328" className="font-semibold text-brand-700 hover:underline active:underline">
              16328
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
