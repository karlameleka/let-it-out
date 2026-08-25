"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/therapist", label: "Overview" },
  { href: "/therapist/clients", label: "Clients" },
  { href: "/therapist/calendar", label: "Calendar" },
  { href: "/therapist/toolkit", label: "Toolkit" },
  { href: "/therapist/referrals", label: "Referrals" },
  { href: "/therapist/profile", label: "Profile & pricing" },
  { href: "/therapist/settings", label: "Settings" },
];

export default function TherapistNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-brand-200 pb-2">
      {TABS.map((t) => {
        const active = t.href === "/therapist" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
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
