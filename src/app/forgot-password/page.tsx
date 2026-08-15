import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <section className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">
            &ldquo;Let it out. One page at a time.&rdquo;
          </p>
          <p className="mt-4 text-sm text-brand-100/80">
            Your journal is a private space to reflect — pick up right where
            you left off.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <Container className="mx-auto max-w-sm px-0">
          <h1 className="font-display text-3xl font-medium text-brand-900">Forgot your password?</h1>
          <p className="mt-2 text-sm text-ink/60">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
          <p className="mt-6 text-sm text-ink/60">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-brand-600 link-grow">
              Log in
            </Link>
          </p>
        </Container>
      </div>
    </section>
  );
}
