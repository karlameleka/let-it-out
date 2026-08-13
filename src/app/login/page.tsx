import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-brand-900">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Log in to continue your journal.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Container>
    </section>
  );
}
