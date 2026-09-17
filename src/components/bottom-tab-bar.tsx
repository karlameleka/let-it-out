"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartHandshake, Newspaper, ShoppingBag, Menu } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { useUnreadTools } from "@/lib/unread-tools-context";
import { hapticTap } from "@/lib/haptics";

export default function BottomTabBar({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();
  const { count: unreadToolsCount } = useUnreadTools();

  // /support runs as a fixed, full-viewport chat screen with the input
  // pinned to the true bottom edge — the tab bar would sit on top of it.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/support")) return null;

  const TABS = [
    { href: "/", label: dict.home, icon: Home, matches: ["/"], badge: 0 },
    { href: "/services", label: dict.ourServices, icon: HeartHandshake, matches: ["/services", "/counseling", "/workshops"], badge: 0 },
    { href: "/resources", label: dict.resources, icon: Newspaper, matches: ["/resources"], badge: unreadToolsCount },
    { href: "/shop", label: dict.shop, icon: ShoppingBag, matches: ["/shop"], badge: 0 },
    { href: "/menu", label: dict.menu, icon: Menu, matches: ["/menu"], badge: 0 },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-200 bg-white shadow-[0_-4px_16px_-4px_rgba(18,53,67,0.12)] lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.85rem)" }}
    >
      {TABS.map(({ href, label, icon: Icon, matches, badge }) => {
        const active = matches.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname?.startsWith(m + "/")));
        return (
          <Link
            key={href}
            href={href}
            onClick={hapticTap}
            className={`flex flex-1 flex-col items-center gap-1 pb-1 pt-2.5 text-[11.5px] font-bold transition-colors duration-300 ${
              active ? "text-brand-700" : "text-ink/40"
            }`}
          >
            {/* Rises out of the bar into a filled circle on activation —
                same "pop up" treatment for every tab, active or not, just
                animated between the two states via the transform/size
                transition below (no JS animation needed: clicking a tab
                navigates, which flips `active`, which transitions). */}
            <span
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ease-out ${
                active
                  ? "-translate-y-3.5 h-14 w-14 bg-brand-700 text-white shadow-lg shadow-brand-900/30"
                  : "translate-y-0 h-9 w-9 bg-transparent text-current"
              }`}
            >
              <Icon className="h-7 w-7" strokeWidth={active ? 2.5 : 1.9} />
              {badge > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
