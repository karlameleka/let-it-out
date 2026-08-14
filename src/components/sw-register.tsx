"use client";

import { useEffect } from "react";

/** Registers the service worker site-wide so the browser can satisfy PWA
 * installability criteria (an active SW is required for `beforeinstallprompt`
 * to fire on Chromium browsers). Push-notification registration in
 * journal-reminder-toggle.tsx reuses the same worker once this is active. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
