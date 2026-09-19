import type { Metadata } from "next";
import { Container, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import ResetPasswordForm from "./reset-password-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, locale] = await Promise.all([searchParams, getLocale()]);
  const t = getDictionary(locale).auth;

  return (
    <section className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">{t.loginQuote}</p>
          <p className="mt-4 text-sm text-brand-100/80">{t.loginQuoteSub}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <Container className="mx-auto max-w-sm px-0">
          <h1 className="font-display text-3xl font-medium text-brand-900">{t.resetTitle}</h1>

          {token ? (
            <>
              <p className="mt-2 text-sm text-ink/60">{t.resetSubtitle}</p>
              <div className="mt-8">
                <ResetPasswordForm token={token} dict={t} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink/60">{t.missingTokenText}</p>
              <ButtonLink href="/forgot-password" className="mt-8">
                {t.requestNewLink}
              </ButtonLink>
            </>
          )}
        </Container>
      </div>
    </section>
  );
}
