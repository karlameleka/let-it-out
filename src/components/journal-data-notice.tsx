"use client";

import { useEffect, useState } from "react";

// Bumped from the old generic wording — this now makes a materially
// different, more specific claim (device-only + encrypted), so previously
// dismissed users see it again once.
const STORAGE_KEY = "lio_journal_notice_dismissed_v2";

export default function JournalDataNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Reading localStorage after mount (rather than as a lazy initial
    // state) keeps the server-rendered and first client render identical,
    // avoiding a hydration mismatch.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!stored) setOpen(true);
  }, []);

  function dismiss() {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <div className="bg-brand-700 px-6 py-5 text-white">
          <h2 className="font-display text-lg font-semibold">Your journal stays on this device</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-ink/70">
            Your journal entries are stored only on this device — encrypted with AES-256-GCM
            and never sent to our servers. That means they won&apos;t carry over if you switch
            devices or clear your browser data. You can download a full copy anytime from
            Account settings, and deleting your account erases everything stored here along
            with it.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-5 w-full rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 active:bg-brand-800"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
