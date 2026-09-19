"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useInstallPrompt, isStandalone } from "@/lib/use-install-prompt";

const DISMISSED_FLAG_KEY = "lio_open_in_app_dismissed";

/**
 * Shown when someone reaches this page in an ordinary browser tab even
 * though Let It Out is already installed on this device, most often right
 * after scanning a journal's QR code. Browsers give web pages no way to
 * force a navigation into an already-installed PWA, so this is a nudge,
 * not a guaranteed redirect: tapping it reopens the current URL, which the
 * OS/browser can hand off to the installed app on platforms that support
 * link capturing (the manifest's launch_handler + related_applications
 * entries make that possible where it's supported).
 */
export default function OpenInAppBanner() {
  const { ready, installed } = useInstallPrompt();
  const [relatedAppInstalled, setRelatedAppInstalled] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStandalone(isStandalone());
    setDismissed(window.sessionStorage.getItem(DISMISSED_FLAG_KEY) === "1");

    const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
    nav.getInstalledRelatedApps?.()
      .then((apps) => {
        if (apps.length > 0) setRelatedAppInstalled(true);
      })
      .catch(() => {});
  }, []);

  if (!ready || standalone || dismissed || (!installed && !relatedAppInstalled)) return null;

  function openInApp() {
    window.location.href = window.location.href;
  }

  function dismiss() {
    window.sessionStorage.setItem(DISMISSED_FLAG_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
      <Smartphone className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={2} />
      <p className="flex-1 text-sm text-brand-900">
        You already have Let It Out installed on this device.{" "}
        <button type="button" onClick={openInApp} className="font-semibold underline underline-offset-2">
          Open in the app
        </button>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-brand-600/60 transition-colors hover:text-brand-600"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
