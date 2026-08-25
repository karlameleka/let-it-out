"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type UnreadToolsContextValue = {
  count: number;
  refetch: () => void;
};

const UnreadToolsContext = createContext<UnreadToolsContextValue | null>(null);

/** Server/Postgres-backed unread count (a therapist-assigned tool/PDF/note/
 * assignment the client hasn't opened "My tools" since) — unlike the cart's
 * localStorage-driven count, this needs a network round trip. Refetched on
 * mount, on every route change, and whenever the tab regains focus, so it
 * stays reasonably fresh without a websocket. */
export function UnreadToolsProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const refetch = useCallback(() => {
    fetch("/api/my-tools/unread-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {
        // Best-effort — a failed fetch just leaves the last known count.
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, pathname]);

  useEffect(() => {
    function onFocus() {
      refetch();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refetch]);

  const value = useMemo(() => ({ count, refetch }), [count, refetch]);

  return <UnreadToolsContext.Provider value={value}>{children}</UnreadToolsContext.Provider>;
}

export function useUnreadTools() {
  const ctx = useContext(UnreadToolsContext);
  if (!ctx) throw new Error("useUnreadTools must be used within UnreadToolsProvider");
  return ctx;
}
