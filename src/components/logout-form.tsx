"use client";

import type { ReactNode } from "react";

/**
 * Drop-in replacement for a plain `<form action={someLogoutAction}>` used
 * by both the user and therapist logout buttons. Clears this origin's
 * Cache Storage before calling the server action — the service worker
 * (src/app/sw.ts) persists NetworkFirst-cached pages for up to 24h, and a
 * destroyed session cookie doesn't reach into Cache Storage, so without
 * this a signed-out session on a shared device would still leave whatever
 * that account was viewing readable from the cache. Cache Storage isn't
 * reachable at all from a Server Action, so this has to run client-side.
 */
export function LogoutForm({
  action,
  className,
  children,
}: {
  action: () => Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      className={className}
      action={async () => {
        if (typeof window !== "undefined" && "caches" in window) {
          try {
            const keys = await window.caches.keys();
            await Promise.all(keys.map((key) => window.caches.delete(key)));
          } catch {
            // Best-effort — an unsupported or locked-down caches API
            // shouldn't block the user from actually signing out.
          }
        }
        await action();
      }}
    >
      {children}
    </form>
  );
}
