import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField, Ribbon } from "@/components/decor";
import LoginForm from "./login-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isGoogleSignInEnabled } from "@/lib/google-auth";

export const metadata: Metadata = { title: "Log In" };

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet. Please log in with your email and password.",
  google_auth_failed: "Google sign-in failed. Please try again.",
  google_email_unverified: "Your Google email isn't verified. Please verify it with Google first.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const dict = getDictionary(await getLocale());
  const { error } = await searchParams;
  const t = dict.auth;
  const googleEnabled = isGoogleSignInEnabled();
  const errorMessage = error ? GOOGLE_ERROR_MESSAGES[error] : undefined;

  return (
    <section className="grid md:min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">{t.loginQuote}</p>
          <p className="mt-4 text-sm text-brand-100/80">{t.loginQuoteSub}</p>
        </div>
      </div>

      <div className="flex flex-col md:justify-center">
        <div className="bg-brand-50 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 md:bg-transparent md:px-0 md:pt-14 md:pb-0">
          <Container className="mx-auto max-w-sm px-0">
            <Ribbon className="md:hidden">{dict.nav.logIn}</Ribbon>
            <h1 className="mt-3 font-display text-3xl font-medium text-brand-900 md:mt-0">{t.loginTitle}</h1>
            <p className="mt-2 text-sm text-ink/60">{t.loginSubtitle}</p>
          </Container>
        </div>
        <div className="flex justify-center px-4 pb-10 sm:px-6 sm:pb-16">
          <Container className="mx-auto max-w-sm px-0">
            <div className="mt-6 md:mt-8">
              <LoginForm dict={dict} googleEnabled={googleEnabled} error={errorMessage} />
            </div>
            <p className="mt-6 text-sm text-ink/60">
              {t.noAccount}{" "}
              <Link href="/signup" className="font-medium text-brand-600 link-grow">
                {dict.nav.signUp}
              </Link>
            </p>
          </Container>
        </div>
      </div>
    </section>
  );
}
