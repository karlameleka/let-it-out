import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField, Ribbon } from "@/components/decor";
import SignupForm from "./signup-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isGoogleSignInEnabled } from "@/lib/google-auth";
import { isSmsOtpEnabled } from "@/lib/sms";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignupPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.auth;
  const googleEnabled = isGoogleSignInEnabled();
  const smsOtpEnabled = isSmsOtpEnabled();

  return (
    <section className="grid md:min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">{t.signupQuote}</p>
          <p className="mt-4 text-sm text-brand-100/80">{t.signupQuoteSub}</p>
        </div>
      </div>

      <div className="flex flex-col md:justify-center">
        <div className="bg-brand-50 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 md:bg-transparent md:px-0 md:pt-14 md:pb-0">
          <Container className="mx-auto max-w-sm px-0">
            <Ribbon className="md:hidden">{dict.nav.signUp}</Ribbon>
            <h1 className="mt-3 font-display text-3xl font-medium text-brand-900 md:mt-0">{t.signupTitle}</h1>
            <p className="mt-2 text-sm text-ink/60">{t.signupSubtitle}</p>
          </Container>
        </div>
        <div className="flex justify-center px-4 pb-10 sm:px-6 sm:pb-16">
          <Container className="mx-auto max-w-sm px-0">
            <div className="mt-6 md:mt-8">
              <SignupForm dict={dict} locale={locale} googleEnabled={googleEnabled} smsOtpEnabled={smsOtpEnabled} />
            </div>
            <p className="mt-6 text-sm text-ink/60">
              {t.alreadyHaveAccount}{" "}
              <Link href="/login" className="font-medium text-brand-600 link-grow">
                {dict.nav.logIn}
              </Link>
            </p>
          </Container>
        </div>
      </div>
    </section>
  );
}
