"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartHandshake, BookOpen, Newspaper, ShoppingBag } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function BottomTabBar({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const TABS = [
    { href: "/", label: dict.home, icon: Home },
    { href: "/journal", label: dict.journal, icon: BookOpen },
    { href: "/counseling", label: dict.ourServices, icon: HeartHandshake },
    { href: "/resources", label: dict.resources, icon: Newspaper },
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
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11.5px] font-bold transition-colors ${
              active ? "text-brand-700" : "text-ink/40"
            }`}
          >
            <Icon className="h-7 w-7" strokeWidth={active ? 2.5 : 1.9} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
