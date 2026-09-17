"use client";

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Haptic tap/success/warning feedback. Inside the native iOS app (see
 * capacitor.config.ts), this calls the real Taptic Engine via
 * @capacitor/haptics — iOS Safari/PWA has no web API for it at all (there's
 * no navigator.vibrate implementation on iOS), so the Vibration API fallback
 * below only ever does anything on Android/desktop web. Capacitor.
 * isNativePlatform() is false and side-effect-free in a plain browser, so
 * these are safe to call from anywhere without a platform check at the
 * call site.
 */
export function hapticTap() {
  if (Capacitor.isNativePlatform()) {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(10);
  } catch {
    // no-op — never let a haptic call break the actual interaction
  }
}

export function hapticSuccess() {
  if (Capacitor.isNativePlatform()) {
    Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.([10, 40, 15]);
  } catch {
    // no-op
  }
}

export function hapticWarning() {
  if (Capacitor.isNativePlatform()) {
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
    return;
  }
  try {
    navigator.vibrate?.(25);
  } catch {
    // no-op
  }
}
