"use client";

import { MotionConfig } from "framer-motion";

/** Wraps the app once at the root so every framer-motion component
 * (tap-scale buttons, wizard progress bar, step transitions, the bottom
 * tab bar's scroll-hide) automatically honors the OS-level "reduce
 * motion" setting — transform/opacity animations collapse to instant
 * changes, no per-component reduced-motion handling needed. Plain CSS
 * animations/transitions are already covered separately by the
 * prefers-reduced-motion media query in globals.css. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
