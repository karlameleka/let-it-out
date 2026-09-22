"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

/** The admin dashboard's top pill nav — highlights whichever section is
 * currently open, since with this many tabs it's otherwise easy to lose
 * track of where you are. */
export default function AdminNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-brand-200 pb-2">
      {tabs.map((t) => {
        const active = t.href === "/admin" ? pathname === "/admin" : pathname === t.href || pathname?.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-brand-700 text-white" : "text-ink/70 hover:bg-white"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
