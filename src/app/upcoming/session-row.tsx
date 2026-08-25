"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationRead } from "@/lib/notification-read-actions";
import { cancelSessionBooking, cancelBookingRequest } from "@/lib/session-cancel-actions";
import { useUpcoming } from "@/lib/upcoming-context";

export default function SessionRow({
  itemId,
  bookingId,
  kind,
  href,
  title,
  dateTimeLabel,
  statusLabel,
  statusClassName,
  canCancel,
  read,
  cancelLabel,
  cancellingLabel,
}: {
  itemId: string;
  bookingId: string;
  kind: "paid" | "request";
  href?: string;
  title: string;
  dateTimeLabel: string;
  statusLabel: string;
  statusClassName: string;
  canCancel: boolean;
  read: boolean;
  cancelLabel: string;
  cancellingLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refetch } = useUpcoming();

  function handleOpen() {
    startTransition(async () => {
      await markNotificationRead(itemId);
      router.refresh();
      refetch();
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = kind === "paid" ? await cancelSessionBooking(bookingId) : await cancelBookingRequest(bookingId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setError(null);
        await markNotificationRead(itemId);
        router.refresh();
        refetch();
      }
    });
  }

  const card = (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5 transition-colors ${
        read ? "border-brand-100" : "border-brand-300"
      }`}
    >
      <div className="flex items-start gap-2">
        {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden />}
        <div>
          <p className={`text-brand-900 ${read ? "font-medium" : "font-semibold"}`}>{title}</p>
          <p className="mt-1 text-sm text-ink/60">{dateTimeLabel}</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canCancel && (
          <button
            type="button"
            disabled={pending}
            onClick={handleCancel}
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {pending ? cancellingLabel : cancelLabel}
          </button>
        )}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>{statusLabel}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleOpen} className="block transition-opacity hover:opacity-80">
        {card}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleOpen} className="block w-full text-start">
      {card}
    </button>
  );
}
