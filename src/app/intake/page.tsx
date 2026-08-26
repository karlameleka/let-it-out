import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { validateIntakeToken } from "@/lib/intake-actions";
import { getIntakeSections } from "@/lib/intake-form-config";
import IntakeForm from "./intake-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Intake Form",
  robots: { index: false, follow: false },
};

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, locale] = await Promise.all([searchParams, getLocale()]);
  const info = token ? await validateIntakeToken(token) : null;
  const t = getDictionary(locale).intake;

  if (!info || !token) {
    return (
      <Container className="max-w-lg py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{t.invalidLinkTitle}</h1>
        <p className="mt-3 text-sm text-ink/60">{t.invalidLinkBody}</p>
      </Container>
    );
  }

  const sections = await getIntakeSections();

  return (
    <IntakeForm
      token={token}
      clientName={info.clientName}
      counselorName={info.counselorName}
      sections={sections}
      dict={t}
    />
  );
}
