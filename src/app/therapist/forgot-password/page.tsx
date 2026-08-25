import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import TherapistForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset Therapist Password" };

export default function TherapistForgotPasswordPage() {
  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-brand-50 px-4 py-16 sm:px-6">
      <Container className="mx-auto max-w-sm px-0">
        <div className="flex flex-col items-center text-center">
          <Logo variant="icon-teal" height={40} />
          <h1 className="mt-4 font-display text-2xl font-medium text-brand-900">Reset your password</h1>
          <p className="mt-1.5 text-sm text-ink/60">
            Enter the email on file for your therapist account and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <TherapistForgotPasswordForm />
        </div>
      </Container>
    </section>
  );
}
