import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import ContactForm from "./contact-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Let It Out.",
};

export default async function ContactPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.contact;

  return (
    <section className="pt-10 pb-16 sm:pt-14 sm:pb-24">
      <Container className="grid gap-12 md:grid-cols-2">
        <div>
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
        </div>
        <ContactForm dict={dict} />
      </Container>
    </section>
  );
}
