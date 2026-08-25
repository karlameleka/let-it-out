"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useUnreadTools } from "@/lib/unread-tools-context";
import { useUpcoming } from "@/lib/upcoming-context";

/** Combines cart count + unread-tools count + upcoming (sessions/events)
 * count into the single OS-level badge on the installed-app icon (Badge
 * API only supports one number per app, so this has to be the one place
 * that calls setAppBadge/clearAppBadge — independent effects would just
 * clobber each other). Not supported everywhere (notably desktop Safari),
 * so this is best-effort and silently no-ops where the API doesn't exist.
 * Renders nothing. */
export default function AppBadgeSync() {
  const { count: cartCount, hydrated } = useCart();
  const { count: unreadToolsCount } = useUnreadTools();
  const { count: upcomingCount } = useUpcoming();

  useEffect(() => {
    if (!hydrated) return;
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    const total = cartCount + unreadToolsCount + upcomingCount;
    if (total > 0) {
      nav.setAppBadge?.(total)?.catch(() => {});
    } else {
      nav.clearAppBadge?.()?.catch(() => {});
    }
  }, [cartCount, unreadToolsCount, upcomingCount, hydrated]);

  return null;
}
