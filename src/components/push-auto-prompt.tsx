"use client";

import { useEffect, useRef } from "react";
import { useInstallPrompt } from "@/lib/use-install-prompt";
import { subscribeBrowserToPush } from "@/lib/push-subscribe";

const PROMPTED_FLAG_KEY = "lio_push_auto_prompted";

/**
 * Fires the notification-permission request automatically the first time
 * a logged-in user opens the installed app, so enabling reminders takes
 * at most one tap total (the native permission prompt itself) instead of
 * a deliberate trip to Account settings. Runs at most once ever, tracked
 * in localStorage — if it's already run, if they're not logged in yet, or
 * if permission has already been decided one way or the other, this does
 * nothing, and the manual "Enable daily reminders" button in Settings is
 * still there as the one-click fallback. Renders nothing.
 */
export default function PushAutoPrompt({ loggedIn }: { loggedIn: boolean }) {
  const { ready, installed } = useInstallPrompt();
  const attempted = useRef(false);

  useEffect(() => {
    if (!ready || !installed || !loggedIn || attempted.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (window.localStorage.getItem(PROMPTED_FLAG_KEY) === "1") return;
    if (Notification.permission !== "default") return;

    attempted.current = true;
    window.localStorage.setItem(PROMPTED_FLAG_KEY, "1");

    navigator.serviceWorker
      .register("/serwist/sw.js")
      .then(() => subscribeBrowserToPush())
      .then((result) => {
        if (!result.ok) console.warn("[push] auto-prompt didn't enable reminders:", result.error);
      })
      .catch((err) => console.error("[push] auto-prompt failed:", err));
  }, [ready, installed, loggedIn]);

  return null;
}
