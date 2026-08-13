import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <section className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-800 p-12 text-white md:flex">
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-8 font-display text-2xl italic leading-snug">
            &ldquo;A self-exploration journey, with you every step of the
            way.&rdquo;
          </p>
          <p className="mt-4 text-sm text-brand-100/80">
            Free daily prompts, a private space to write, and a history you
            can look back on.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6">
        <Container className="mx-auto max-w-sm px-0">
          <h1 className="font-display text-3xl font-semibold text-brand-900">
            Start your journey
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Create a free account for daily journaling prompts and a private
            space to write.
          </p>
          <div className="mt-8">
            <SignupForm />
          </div>
          <p className="mt-6 text-sm text-ink/60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 link-grow">
              Log in
            </Link>
          </p>
        </Container>
      </div>
    </section>
  );
}
