"use client";

import { useActionState, useState } from "react";
import { submitWorkshopInterest } from "@/lib/workshop-interest-actions";
import { Logo } from "@/components/logo";
import { Button, Container } from "@/components/ui";
import HoneypotField from "@/components/honeypot-field";
import TurnstileWidget from "@/components/turnstile-widget";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function WorkshopNotifySection({ dict }: { dict: Dictionary["workshopNotify"] }) {
  const [state, formAction, pending] = useActionState(submitWorkshopInterest, undefined);
  const [turnstileReady, setTurnstileReady] = useState(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  return (
    <section className="bg-brand-700 py-16 sm:py-20">
      <Container className="max-w-xl text-center text-white">
        <Logo variant="icon-white" height={44} className="mx-auto" />
        <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">{dict.title}</h2>

        {state?.success ? (
          <p className="mt-4 text-sm font-medium text-white/90">{dict.successMessage}</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-white/70">{dict.description}</p>
            <form action={formAction} className="mt-6 flex flex-col items-center gap-2">
              <HoneypotField />
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={dict.emailPlaceholder}
                  className="w-full flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/60 sm:max-w-xs"
                />
                <Button type="submit" variant="bright" disabled={pending || !turnstileReady} className="shrink-0">
                  {pending ? dict.submitting : dict.submit}
                </Button>
              </div>
              <TurnstileWidget theme="dark" onReady={() => setTurnstileReady(true)} onError={() => setTurnstileReady(true)} />
            </form>
            {state?.error && <p className="mt-2 text-xs text-red-200">{state.error}</p>}
          </>
        )}
      </Container>
    </section>
  );
}
