"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, BellRing, Share } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push-actions";
import { useInstallPrompt } from "@/lib/use-install-prompt";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export default function JournalReminderToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    navigator.serviceWorker
      .register("/serwist/sw.js")
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
        setError(err instanceof Error ? err.message : "Couldn't check your notification status.");
      });
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        if (permission !== "denied") {
          setError("Permission wasn't granted — try again and allow notifications when prompted.");
        }
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        // Deliberately "off" (button stays visible) rather than
        // "unsupported" (renders nothing) — this is a real, fixable
        // deployment misconfiguration, not a browser limitation, and
        // hiding the button entirely would make the error unreachable.
        setStatus("off");
        setError("Push isn't configured on this deployment (missing VAPID public key).");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const json = subscription.toJSON();
      const result = await subscribeToPush({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });

      setStatus(result.success ? "on" : "off");
      if (!result.success) {
        setError(result.error ?? "Saving the subscription failed for an unknown reason.");
      }
    } catch (err) {
      // Surfaced on-screen (not just console) since this most often runs on
      // a phone with no attached debugger — the failure needs to be visible
      // without remote-debugging tools.
      console.error("[push] enable failed:", err);
      setStatus("off");
      setError(err instanceof Error ? err.message : "Something went wrong enabling reminders.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking" || !installReady) return null;

  if (iOS && !installed) {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-xs text-ink/60">
        <p className="flex items-start gap-1.5">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />
          <span>
            On iPhone, push notifications only work once Let It Out is added to your Home Screen.{" "}
            <Link href="/install" className="font-medium text-brand-600 underline-offset-2 hover:underline">
              Install the app
            </Link>{" "}
            to enable reminders.
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
        Reminders blocked in browser settings
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={status === "on" ? disable : enable}
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
        {status === "on" ? "Daily reminders on" : "Enable daily reminders"}
      </button>
      {error && <p className="mt-2 max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}
