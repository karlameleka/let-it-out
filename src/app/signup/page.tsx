import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">
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
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </Container>
    </section>
  );
}
