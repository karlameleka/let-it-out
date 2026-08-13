"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { submitWorkshopInterest } from "@/lib/workshop-interest-actions";
import { Logo } from "@/components/logo";

const STORAGE_KEY = "lio_workshop_popup_seen";
const SHOW_AFTER_MS = 6000;

export default function WorkshopInterestPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [state, formAction, pending] = useActionState(submitWorkshopInterest, undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state?.success && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [state?.success]);

  function dismiss() {
    setVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (pathname?.startsWith("/admin")) return null;
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-pop-in sm:bottom-6 sm:right-6">
      <div className="relative overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink/50 shadow-sm hover:text-ink"
        >
          ✕
        </button>

        <div className="relative overflow-hidden bg-brand-700 px-6 pb-8 pt-6 text-white">
          <Logo
            variant="icon-white"
            height={44}
            className="animate-wiggle"
          />
          <h3 className="mt-3 font-display text-xl font-semibold leading-tight">
            Don&apos;t miss our next workshop!
          </h3>
        </div>

        <div className="px-6 py-5">
          {state?.success ? (
            <p className="text-sm font-medium text-brand-700">
              You&apos;re on the list — we&apos;ll email you the moment we
              announce our next session.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink/70">
                Be the first to know when we open spots for our next training
                or workshop. No spam, just the good stuff.
              </p>
              <form action={formAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  className="w-full flex-1 rounded-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="shrink-0 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_0_theme(colors.brand.800)] transition-all hover:bg-brand-400 hover:translate-y-px hover:shadow-[0_2px_0_0_theme(colors.brand.800)] disabled:opacity-60"
                >
                  {pending ? "..." : "Notify me"}
                </button>
              </form>
              {state?.error && (
                <p className="mt-2 text-xs text-red-600">{state.error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
