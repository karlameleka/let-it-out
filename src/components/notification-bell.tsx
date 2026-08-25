"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUpcoming } from "@/lib/upcoming-context";

export default function NotificationBell({ label = "Upcoming" }: { label?: string }) {
  const { count } = useUpcoming();

  return (
    <Link
      href="/upcoming"
      aria-label={`${label}, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-ink hover:text-brand-700 active:text-brand-700"
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
