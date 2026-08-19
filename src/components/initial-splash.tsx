"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

/**
 * Native-app-style splash — brand-700 teal with the white logo, matching
 * the PWA's manifest background_color — shown once on a cold/hard load
 * that lands on the home page ("/", the PWA's start_url).
 *
 * Lives in the persistent RootLayout rather than as a route-level
 * loading.tsx: layout.tsx never remounts during client-side navigation,
 * so `useState(() => pathname === "/")` only ever evaluates truthy on the
 * initial mount of a hard page load — it naturally never reappears when
 * navigating between pages in-app.
 */
export default function InitialSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(() => pathname === "/");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fadeTimer = setTimeout(() => setFading(true), 500);
    const hideTimer = setTimeout(() => setVisible(false), 800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-brand-700 transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <Logo variant="horizontal-white" height={44} className="animate-pop-in" />
    </div>
  );
}
