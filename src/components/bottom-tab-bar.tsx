"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartHandshake, BookOpen, ShoppingBag } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function BottomTabBar({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const TABS = [
    { href: "/", label: dict.home, icon: Home },
    { href: "/counseling", label: dict.counseling, icon: HeartHandshake },
    { href: "/journal", label: dict.journal, icon: BookOpen },
    { href: "/shop", label: dict.shop, icon: ShoppingBag },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              active ? "text-brand-700" : "text-ink/45"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
