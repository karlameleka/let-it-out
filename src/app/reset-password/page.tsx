import type { Metadata } from "next";
import { Container, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

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
          <h1 className="font-display text-3xl font-semibold text-brand-900">Reset your password</h1>

          {token ? (
            <>
              <p className="mt-2 text-sm text-ink/60">Choose a new password with at least 8 characters.</p>
              <div className="mt-8">
                <ResetPasswordForm token={token} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink/60">
                This link is missing its reset token. Request a new one below.
              </p>
              <ButtonLink href="/forgot-password" className="mt-8">
                Request a new link
              </ButtonLink>
            </>
          )}
        </Container>
      </div>
    </section>
  );
}
