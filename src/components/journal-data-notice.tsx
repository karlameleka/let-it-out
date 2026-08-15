"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "lio_journal_notice_dismissed";

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
          Your entries are private to you. If you ever delete your account, your journal
          entries are permanently deleted along with it — you can download a full copy
          anytime from{" "}
          <Link href="/account" className="font-medium text-brand-600 underline">
            Account settings
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-ink/40 transition-colors hover:bg-brand-50 hover:text-ink/60"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
