import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Container, Eyebrow } from "@/components/ui";
import ChangePasswordForm from "./change-password-form";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Container className="max-w-xl py-16 sm:py-20">
      <Eyebrow>Account</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold text-brand-900">Settings</h1>
      <p className="mt-2 text-sm text-ink/60">Signed in as {user.email}</p>

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">Change password</h2>
        <p className="mt-1 text-sm text-ink/60">Choose a new password with at least 8 characters.</p>
        <ChangePasswordForm />
      </div>
    </Container>
  );
}
