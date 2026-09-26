"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, BellOff, BellRing, Settings, Share } from "lucide-react";
import { subscribeBrowserToPush } from "@/lib/push-subscribe";
import { useInstallPrompt } from "@/lib/use-install-prompt";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export default function JournalReminderToggle({ dict }: { dict: Dictionary["account"] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisableHelp, setShowDisableHelp] = useState(false);
  // iOS Safari only exposes the Push/Notification APIs at all once the
  // site has been added to the Home Screen (iOS 16.4+) — there is no way
  // to enable push notifications in a regular Safari tab, so that state is
  // detected here to explain why, rather than just silently hiding the
  // toggle like any other unsupported browser.
  const { iOS, installed, ready: installReady } = useInstallPrompt();

  useEffect(() => {
    // Reading browser support/permission state after mount (rather than
    // during render) is intentional — it keeps server and first client
    // render identical, avoiding a hydration mismatch.
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    // .ready (not .register()) — the same registration source
    // subscribeBrowserToPush() subscribes through below. SerwistProvider in
    // the root layout already registers the worker on every page, so
    // re-registering it here was redundant and, on a slow/flaky mobile
    // connection, could itself fail or hang; .ready just waits on the
    // worker that's already active, with no network request of its own.
    // Checking against a *different* registration than the one actually
    // subscribed through is exactly the kind of mismatch that could make
    // an already-enabled subscription look "off" again after navigating
    // back to this page.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch((err) => {
        // This used to fall back to "unsupported", which renders nothing —
        // indistinguishable from a browser that genuinely lacks Push
        // support. That made a real failure here (a broken service worker,
        // a stale/invalid subscription, anything) look like the toggle had
        // simply vanished, with zero way to tell why. Show the button plus
        // the actual error instead, so it's recoverable and debuggable.
        console.error("[push] checking existing subscription failed:", err);
        setStatus("off");
        setError(err instanceof Error ? err.message : dict.remindersCouldNotCheck);
      });
    // Runs once on mount to check existing subscription state — dict is
    // only read inside a rarely-hit error path, not worth re-running for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const result = await subscribeBrowserToPush();
      if (!result.ok) {
        // Deliberately "off" (button stays visible) rather than
        // "unsupported" (renders nothing) — these are recoverable
        // failures (permission dismissed, missing VAPID key, save
        // failed), not a browser limitation, and hiding the button
        // entirely would make the error unreachable.
        setStatus(result.permission === "denied" ? "denied" : "off");
        if (result.error) setError(result.error);
        return;
      }
      setStatus("on");
      // The onboarding checklist's "reminders" step is computed server-side
      // (from whether a push subscription row exists) and lives in the
      // root layout, which this page alone won't re-fetch on its own —
      // without this it keeps showing unchecked until some unrelated
      // navigation happens to force a refresh.
      router.refresh();
    } catch (err) {
      // Surfaced on-screen (not just console) since this most often runs on
      // a phone with no attached debugger — the failure needs to be visible
      // without remote-debugging tools.
      console.error("[push] enable failed:", err);
      setStatus("off");
      setError(err instanceof Error ? err.message : dict.remindersEnableError);
    } finally {
      setBusy(false);
    }
  }

  // Unsubscribing the push registration from here used to be enough to flip
  // this back to "off" — but it left Notification.permission itself still
  // "granted", so the OS/browser still considers this site allowed to send
  // notifications. Anything that resubscribes later (this button, the
  // one-time auto-prompt on a future reinstall, etc.) would then silently
  // re-enable them without ever asking again, since permission was never
  // actually revoked. The only way to truly turn them off is at the
  // phone/browser level, so this now points there instead of pretending a
  // JS-only unsubscribe is a real "off" switch.
  function showDisableInstructions() {
    setShowDisableHelp((v) => !v);
  }

  if (status === "checking" || !installReady) return null;

  if (iOS && !installed) {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-xs text-ink/60">
        <p className="flex items-start gap-1.5">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />
          <span>
            {dict.remindersIosInstallPrefix}{" "}
            <Link href="/install" className="font-medium text-brand-600 underline-offset-2 hover:underline">
              {dict.remindersIosInstallLink}
            </Link>{" "}
            {dict.remindersIosInstallSuffix}
          </span>
        </p>
      </div>
    );
  }

  if (status === "unsupported") return null;

  if (status === "denied") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 px-4 py-2 text-xs text-ink/40">
        <BellOff className="h-3.5 w-3.5" strokeWidth={2} />
        {dict.remindersBlocked}
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        data-onboarding="reminders-toggle"
        onClick={status === "on" ? showDisableInstructions : enable}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
          status === "on"
            ? "border-brand-500 bg-brand-50 text-brand-700"
            : "border-brand-200 text-brand-600 hover:bg-brand-50 active:bg-brand-50"
        }`}
      >
        {status === "on" ? (
          <BellRing className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Bell className="h-4 w-4" strokeWidth={2} />
        )}
        {status === "on" ? dict.remindersOn : dict.remindersEnable}
      </button>
      {error && <p className="mt-2 max-w-xs text-xs text-red-600">{error}</p>}
      {status === "on" && showDisableHelp && (
        <div className="mt-2 max-w-xs rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-xs text-ink/60">
          <p className="flex items-start gap-1.5">
            <Settings className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />
            <span>{iOS ? dict.remindersDisableInstructionsIos : dict.remindersDisableInstructions}</span>
          </p>
          <button
            type="button"
            onClick={() => setShowDisableHelp(false)}
            className="mt-2 font-medium text-brand-600 link-grow"
          >
            {dict.remindersDisableInstructionsClose}
          </button>
        </div>
      )}
    </div>
  );
}
