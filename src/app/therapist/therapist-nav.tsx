"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_TABS = [
  { href: "/therapist", label: "Overview" },
  { href: "/therapist/clients", label: "Clients" },
  { href: "/therapist/calendar", label: "Calendar" },
  { href: "/therapist/toolkit", label: "Toolkit" },
  { href: "/therapist/referrals", label: "Referrals" },
  { href: "/therapist/profile", label: "Profile & pricing" },
  { href: "/therapist/settings", label: "Settings" },
];

// Only shown to counselors an admin has granted Counselor.canEditFormsConfig
// — editing the shared sitewide intake form / reflection sheet, not
// something every counselor needs access to.
const FORMS_CONFIG_TABS = [
  { href: "/therapist/intake-form", label: "Intake form" },
  { href: "/therapist/reflection-sheet", label: "Reflection sheet" },
];

export default function TherapistNav({ canEditFormsConfig = false }: { canEditFormsConfig?: boolean }) {
  const pathname = usePathname();
  const TABS = canEditFormsConfig ? [...BASE_TABS, ...FORMS_CONFIG_TABS] : BASE_TABS;

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
