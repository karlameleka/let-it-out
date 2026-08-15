"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOSSafari() {
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Browsers (iOS Safari in particular) give web pages no way to ask "has this
// been added to the home screen?" — display-mode only reveals whether *this*
// tab happens to be running standalone right now. So the first time we ever
// observe standalone mode, we remember it here; a later visit in an ordinary
// browser tab (not standalone) can then still know it was installed before.
const INSTALLED_FLAG_KEY = "lio_pwa_installed";

function wasEverInstalled() {
  return window.localStorage.getItem(INSTALLED_FLAG_KEY) === "1";
}

function rememberInstalled() {
  window.localStorage.setItem(INSTALLED_FLAG_KEY, "1");
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iOS, setIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read browser/environment state after mount only, so the server-rendered
    // and first client render stay identical and we avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIOS(isIOSSafari());
    const standaloneNow = isStandalone();
    if (standaloneNow) rememberInstalled();
    setInstalled(standaloneNow || wasEverInstalled());
    setReady(true);

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      rememberInstalled();
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  return {
    ready,
    installed,
    iOS,
    canPromptInstall: deferredPrompt !== null,
    promptInstall,
  };
}
