import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { getCurrentCounselor } from "@/lib/therapist-session";
import TherapistLoginForm from "./login-form";

export const metadata: Metadata = { title: "Therapist Login" };

export default async function TherapistLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ linkError?: string }>;
}) {
  const counselor = await getCurrentCounselor();
  if (counselor) redirect("/therapist");
  const { linkError } = await searchParams;

  return (
    <section className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-brand-50 px-4 py-16 sm:px-6">
      <Container className="mx-auto max-w-sm px-0">
        <div className="flex flex-col items-center text-center">
          <Logo variant="icon-teal" height={40} />
          <h1 className="mt-4 font-display text-2xl font-medium text-brand-900">Therapist portal</h1>
          <p className="mt-1.5 text-sm text-ink/60">Log in to manage your clients, calendar, and profile.</p>
        </div>

        {linkError && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            That login link is invalid or has expired. Please log in below, or ask the admin team for a new link.
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <TherapistLoginForm />
        </div>

        <p className="mt-5 text-center text-sm text-ink/60">
          <Link href="/therapist/forgot-password" className="font-medium text-brand-600 link-grow">
            Forgot your password?
          </Link>
        </p>
      </Container>
    </section>
  );
}
