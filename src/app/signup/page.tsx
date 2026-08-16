import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import SignupForm from "./signup-form";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignupPage() {
  const dict = getDictionary(await getLocale());
  const t = dict.auth;

  return (
    <section className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">{t.signupQuote}</p>
          <p className="mt-4 text-sm text-brand-100/80">{t.signupQuoteSub}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
        <Container className="mx-auto max-w-sm px-0">
          <h1 className="font-display text-3xl font-medium text-brand-900">{t.signupTitle}</h1>
          <p className="mt-2 text-sm text-ink/60">{t.signupSubtitle}</p>
          <div className="mt-8">
            <SignupForm dict={dict} />
          </div>
          <p className="mt-6 text-sm text-ink/60">
            {t.alreadyHaveAccount}{" "}
            <Link href="/login" className="font-medium text-brand-600 link-grow">
              {dict.nav.logIn}
            </Link>
          </p>
        </Container>
      </div>
    </section>
  );
}
