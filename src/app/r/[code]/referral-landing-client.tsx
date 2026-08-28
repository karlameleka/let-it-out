"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

// Read by referral-activation-watcher.tsx once this friend's PWA install
// completes — that's the only thing that ever turns this into a reward.
const PENDING_REFERRAL_KEY = "lio_referral_pending";

export default function ReferralLandingClient({ code, valid }: { code: string; valid: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (valid) {
      try {
        window.localStorage.setItem(PENDING_REFERRAL_KEY, code);
      } catch {
        // no-op — a blocked/full localStorage just means this friend's
        // eventual install won't self-report; not worth failing the redirect over.
      }
    }
    const timer = setTimeout(() => router.replace("/"), 600);
    return () => clearTimeout(timer);
  }, [code, valid, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      <Logo variant="horizontal-teal" height={36} />
      <p className="text-sm font-medium text-ink/60">Taking you to Let It Out&hellip;</p>
    </div>
  );
}
