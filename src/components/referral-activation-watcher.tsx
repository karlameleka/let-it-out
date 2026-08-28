"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, X } from "lucide-react";
import { activateReferral } from "@/lib/referral-actions";
import { hapticSuccess } from "@/lib/haptics";

const PENDING_REFERRAL_KEY = "lio_referral_pending";
const REWARD_CODE_KEY = "lio_referral_reward_code";
const REWARD_DISMISSED_KEY = "lio_referral_reward_dismissed";

/**
 * Mounted once, globally (see layout.tsx), so it's listening no matter
 * which page happens to be open the moment a friend's PWA install
 * completes — that's the browser's `appinstalled` event, the single
 * trigger for activating a referral (see activateReferral() for why
 * neither visiting the invite link nor signing up alone counts). On
 * success, shows a small dismissible banner with the friend's new 20%-off
 * code so they don't have to go hunting for it.
 */
export default function ReferralActivationWatcher() {
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(REWARD_DISMISSED_KEY) !== "1") {
        const saved = window.localStorage.getItem(REWARD_CODE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved) setRewardCode(saved);
      }
    } catch {
      // no-op
    }

    async function onInstalled() {
      let pending: string | null = null;
      try {
        pending = window.localStorage.getItem(PENDING_REFERRAL_KEY);
      } catch {
        return;
      }
      if (!pending) return;

      const result = await activateReferral(pending).catch(() => ({ success: false as const }));
      try {
        window.localStorage.removeItem(PENDING_REFERRAL_KEY);
        if (result.success) {
          window.localStorage.setItem(REWARD_CODE_KEY, result.promoCode);
          window.localStorage.removeItem(REWARD_DISMISSED_KEY);
          setRewardCode(result.promoCode);
          hapticSuccess();
        }
      } catch {
        // no-op — the reward already exists server-side even if we can't persist it locally
      }
    }

    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  function handleDismiss() {
    setRewardCode(null);
    try {
      window.localStorage.setItem(REWARD_DISMISSED_KEY, "1");
    } catch {
      // no-op
    }
  }

  async function handleCopy() {
    if (!rewardCode) return;
    try {
      await navigator.clipboard.writeText(rewardCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op — clipboard access can be denied; the code is still visible to read/type manually
    }
  }

  if (!rewardCode) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-xl sm:bottom-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Gift className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-900">You unlocked 20% off!</p>
          <p className="mt-0.5 text-xs text-ink/60">Use this code on your first order.</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-lg bg-brand-50 px-2.5 py-1 font-mono text-sm font-semibold text-brand-800">
              {rewardCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-ink/30 transition-colors hover:text-ink/50"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
