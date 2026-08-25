"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartHandshake, Newspaper, ShoppingBag } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { useUnreadTools } from "@/lib/unread-tools-context";
import { hapticTap } from "@/lib/haptics";

export default function BottomTabBar({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();
  const { count: unreadToolsCount } = useUnreadTools();

  if (pathname?.startsWith("/admin")) return null;

  const TABS = [
    { href: "/", label: dict.home, icon: Home, matches: ["/"], badge: 0 },
    { href: "/services", label: dict.ourServices, icon: HeartHandshake, matches: ["/services", "/counseling", "/workshops"], badge: 0 },
    { href: "/resources", label: dict.resources, icon: Newspaper, matches: ["/resources"], badge: unreadToolsCount },
    { href: "/shop", label: dict.shop, icon: ShoppingBag, matches: ["/shop"], badge: 0 },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, icon: Icon, matches, badge }) => {
        const active = matches.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname?.startsWith(m + "/")));
        return (
          <Link
            key={href}
            href={href}
            onClick={hapticTap}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11.5px] font-bold transition-colors ${
              active ? "text-brand-700" : "text-ink/40"
            }`}
          >
            <span className="relative">
              <Icon className="h-7 w-7" strokeWidth={active ? 2.5 : 1.9} />
              {badge > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white">
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
