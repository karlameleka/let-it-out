"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useUpcoming } from "@/lib/upcoming-context";

export default function NotificationBell({ label = "Upcoming" }: { label?: string }) {
  const { count } = useUpcoming();
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = pathname === "/upcoming";

  const badge = count > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white">
      {count}
    </span>
  );

  // Tapping the bell while its own page is already open closes it (goes
  // back) instead of re-navigating to the same page.
  if (isOpen) {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        aria-label={`${label}, ${count} item${count === 1 ? "" : "s"}`}
        className="relative inline-flex items-center justify-center rounded-md p-2 text-brand-700"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {badge}
      </button>
    );
  }

  return (
    <Link
      href="/upcoming"
      aria-label={`${label}, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-ink hover:text-brand-700 active:text-brand-700"
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {badge}
    </Link>
  );
}
