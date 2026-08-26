import { subscribeToPush } from "@/lib/push-actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushSubscribeResult =
  | { ok: true }
  | { ok: false; permission: NotificationPermission; error: string };

/**
 * Requests notification permission (if not already decided) and, once
 * granted, subscribes this browser to push and saves the subscription
 * server-side. Shared between the manual toggle in Account settings and
 * the one-time auto-prompt fired right after PWA install, so both paths
 * behave identically and only diverge in when they're called.
 */
export async function subscribeBrowserToPush(): Promise<PushSubscribeResult> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      permission,
      // No message for "denied" — callers show a dedicated blocked-state
      // pill instead, so surfacing text here would be redundant.
      error:
        permission === "denied"
          ? ""
          : "Permission wasn't granted — try again and allow notifications when prompted.",
    };
  }

  const registration = await navigator.serviceWorker.ready;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return {
      ok: false,
      permission,
      error: "Push isn't configured on this deployment (missing VAPID public key).",
    };
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

  if (!result.success) {
    return { ok: false, permission, error: result.error ?? "Saving the subscription failed for an unknown reason." };
  }

  return { ok: true };
}
