import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { verifyEmailPreferencesToken, getEmailPreference } from "@/lib/email-preferences";
import EmailPreferencesForm from "./email-preferences-form";

export const metadata: Metadata = { title: "Email Preferences" };

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale).emailPreferences;

  const valid = Boolean(email && token && verifyEmailPreferencesToken(email, token));

  if (!valid || !email || !token) {
    return (
      <Container className="max-w-lg py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{dict.invalidLinkTitle}</h1>
        <p className="mt-3 text-sm text-ink/60">{dict.invalidLinkBody}</p>
      </Container>
    );
  }

  const pref = await getEmailPreference(email);

  return (
    <Container className="max-w-lg py-20">
      <h1 className="font-display text-2xl font-semibold text-brand-900">{dict.pageTitle}</h1>
      <p className="mt-2 text-sm text-ink/60">{dict.intro.replace("{email}", email)}</p>
      <EmailPreferencesForm email={email} token={token} initialOptOut={pref.notificationsOptOut} dict={dict} />
      <p className="mt-6 border-t border-brand-100 pt-4 text-xs text-ink/45">{dict.essentialNote}</p>
    </Container>
  );
}
