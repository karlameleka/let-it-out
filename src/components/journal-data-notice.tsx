"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Bumped from the old generic wording — this now makes a materially
// different, more specific claim (device-only + encrypted), so previously
// dismissed users see it again once.
const STORAGE_KEY = "lio_journal_notice_dismissed_v2";

export default function JournalDataNotice() {
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reading localStorage after mount (rather than as a lazy initial
    // state) keeps the server-rendered and first client render identical,
    // avoiding a hydration mismatch.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setDismissed(true);
    setHydrated(true);
  }, []);

  function dismiss() {
    setDismissed(true);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!hydrated || dismissed) return null;

  return (
    <div className="animate-pop-in mx-auto mt-6 max-w-3xl px-4 sm:px-6">
      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3.5 shadow-sm">
        <p className="flex-1 text-sm text-ink/70">
          Your journal entries are stored only on this device — encrypted with AES-256-GCM
          and never sent to our servers. That means they won&apos;t carry over if you switch
          devices or clear your browser data. You can download a full copy anytime from{" "}
          <Link href="/account" className="font-medium text-brand-600 underline">
            Account settings
          </Link>
          , and deleting your account erases everything stored here along with it.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-ink/40 transition-colors hover:bg-brand-50 active:bg-brand-50 hover:text-ink/60 active:text-ink/60"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
