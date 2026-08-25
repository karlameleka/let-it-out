"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type UpcomingContextValue = {
  count: number;
  refetch: () => void;
};

const UpcomingContext = createContext<UpcomingContextValue | null>(null);

/** Server/Postgres-backed count of upcoming sessions + events for the
 * logged-in client — drives the header bell badge and the installed-app
 * icon badge. Refetched on mount, on every route change, and whenever the
 * tab regains focus, mirroring UnreadToolsProvider. */
export function UpcomingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const refetch = useCallback(() => {
    fetch("/api/upcoming/unread-count")
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

  return <UpcomingContext.Provider value={value}>{children}</UpcomingContext.Provider>;
}

export function useUpcoming() {
  const ctx = useContext(UpcomingContext);
  if (!ctx) throw new Error("useUpcoming must be used within UpcomingProvider");
  return ctx;
}
