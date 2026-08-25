"use client";

/**
 * Best-effort haptic tap via the Vibration API. Silently no-ops where
 * unsupported (notably iOS Safari, which doesn't implement navigator.vibrate
 * at all as of this writing — there's no web API for the Taptic Engine) or
 * where the user has motion/vibration disabled at the OS level. Durations
 * are short and deliberately restrained (10–20ms) to read as a tap, not a
 * buzz.
 */
export function hapticTap() {
  try {
    navigator.vibrate?.(10);
  } catch {
    // no-op — never let a haptic call break the actual interaction
  }
}

export function hapticSuccess() {
  try {
    navigator.vibrate?.([10, 40, 15]);
  } catch {
    // no-op
  }
}

export function hapticWarning() {
  try {
    navigator.vibrate?.(25);
  } catch {
    // no-op
  }
}
