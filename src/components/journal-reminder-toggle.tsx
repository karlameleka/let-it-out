"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push-actions";

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
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("unsupported");
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
    } catch {
      setStatus("off");
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

  if (status === "checking" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 px-4 py-2 text-xs text-ink/40">
        <BellOff className="h-3.5 w-3.5" strokeWidth={2} />
        Reminders blocked in browser settings
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={status === "on" ? disable : enable}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        status === "on"
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-brand-200 text-brand-600 hover:bg-brand-50"
      }`}
    >
      {status === "on" ? (
        <BellRing className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Bell className="h-4 w-4" strokeWidth={2} />
      )}
      {status === "on" ? "Daily reminders on" : "Enable daily reminders"}
    </button>
  );
}
