import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getPendingTwoFactorUserId } from "@/lib/session";
import VerifyTwoFactorForm from "./verify-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Verify it's you", robots: { index: false, follow: false } };

export default async function VerifyTwoFactorPage() {
  const [pendingUserId, locale] = await Promise.all([getPendingTwoFactorUserId(), getLocale()]);
  if (!pendingUserId) {
    redirect("/login");
  }
  const t = getDictionary(locale).auth;

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-16">
      <Container className="mx-auto max-w-sm px-0">
        <h1 className="font-display text-3xl font-medium text-brand-900">{t.verifyTitle}</h1>
        <p className="mt-2 text-sm text-ink/60">{t.verifySubtitle}</p>
        <div className="mt-8">
          <VerifyTwoFactorForm dict={t} />
        </div>
      </Container>
    </section>
  );
}
