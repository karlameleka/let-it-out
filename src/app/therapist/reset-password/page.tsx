import type { Metadata } from "next";
import { Container, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import TherapistResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Set Therapist Password" };

export default async function TherapistResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-brand-50 px-4 py-16 sm:px-6">
      <Container className="mx-auto max-w-sm px-0">
        <div className="flex flex-col items-center text-center">
          <Logo variant="icon-teal" height={40} />
          <h1 className="mt-4 font-display text-2xl font-medium text-brand-900">
            {token ? "Set your password" : "Reset your password"}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          {token ? (
            <>
              <p className="mb-5 text-sm text-ink/60">Choose a password with at least 8 characters.</p>
              <TherapistResetPasswordForm token={token} />
            </>
          ) : (
            <>
              <p className="mb-5 text-sm text-ink/60">
                This link is missing its reset token. Request a new one below.
              </p>
              <ButtonLink href="/therapist/forgot-password">Request a new link</ButtonLink>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
