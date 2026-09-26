"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Runs once, only inside the native iOS shell (Capacitor.isNativePlatform()
 * is false in every browser/PWA context, so this is a no-op there). Hides
 * the native launch splash screen (see launchAutoHide: false in
 * capacitor.config.ts — it's kept visible until this fires, since the
 * remote page takes longer to paint than the plugin's default timer
 * assumes) and matches the status bar to the app's brand color. Renders
 * nothing.
 */
export default function NativeAppInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#1e5b73" }).catch(() => {});

    // Hidden after mount (next paint) rather than immediately on effect
    // fire, so the WebView has actually rendered the page underneath
    // before the splash goes away.
    const timer = setTimeout(() => {
      SplashScreen.hide().catch(() => {});
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
