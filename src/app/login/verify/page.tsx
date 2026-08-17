import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getPendingTwoFactorUserId } from "@/lib/session";
import VerifyTwoFactorForm from "./verify-form";

export const metadata: Metadata = { title: "Verify it's you", robots: { index: false, follow: false } };

export default async function VerifyTwoFactorPage() {
  const pendingUserId = await getPendingTwoFactorUserId();
  if (!pendingUserId) {
    redirect("/login");
  }

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-16">
      <Container className="mx-auto max-w-sm px-0">
        <h1 className="font-display text-3xl font-medium text-brand-900">Verify it&rsquo;s you</h1>
        <p className="mt-2 text-sm text-ink/60">
          Enter the 6-digit code from your authenticator app, or one of your backup codes.
        </p>
        <div className="mt-8">
          <VerifyTwoFactorForm />
        </div>
      </Container>
    </section>
  );
}
