"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/lib/notification-read-actions";
import { useUpcoming } from "@/lib/upcoming-context";

export default function MarkAllReadButton({ label }: { label: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { refetch } = useUpcoming();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markAllNotificationsRead();
          router.refresh();
          refetch();
        })
      }
      className="rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
