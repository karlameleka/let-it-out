import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow, Container } from "@/components/ui";
import { Logo } from "@/components/logo";
import { DoodleField } from "@/components/decor";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <section className="grid min-h-[calc(100vh-73px)] md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-brand-700 via-brand-800 to-brand-900 p-12 text-white md:flex">
        <AmbientGlow palette="light" intensity={0.16} />
        <DoodleField />
        <div className="relative max-w-sm">
          <Logo variant="icon-white" height={72} />
          <p className="mt-9 font-display text-2xl italic leading-relaxed tracking-tight">
            &ldquo;Let it out. One page at a time.&rdquo;
          </p>
          <p className="mt-5 text-sm leading-relaxed text-brand-100/80">
            Your journal is a private space to reflect — pick up right where
            you left off.
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        <AmbientGlow palette="brand" intensity={0.14} />
        <Container className="relative mx-auto max-w-sm px-0">
          <h1 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight text-brand-900 sm:text-4xl">Welcome back</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">Log in to continue your journal.</p>
          <div className="mt-9">
            <LoginForm />
          </div>
          <p className="mt-7 text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-brand-600 link-grow">
              Sign up
            </Link>
          </p>
        </Container>
      </div>
    </section>
  );
}
