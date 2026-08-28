"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Video } from "lucide-react";
import { markNotificationRead, dismissNotification } from "@/lib/notification-read-actions";
import { cancelSessionBooking, cancelBookingRequest } from "@/lib/session-cancel-actions";
import { useUpcoming } from "@/lib/upcoming-context";
import { hapticTap, hapticWarning } from "@/lib/haptics";
import SwipeToDelete from "./swipe-to-delete";
import type { Dictionary } from "@/lib/i18n/dictionary";

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
  meetingLink,
  dict,
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
  meetingLink?: string | null;
  dict: Dictionary["upcoming"];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { refetch } = useUpcoming();

  const expandable = Boolean(href) || canCancel || Boolean(meetingLink);

  function handleToggle() {
    hapticTap();
    // Called synchronously so the browser still attributes it to this tap
    // (and doesn't block it as a pop-up) — a session with a link is most
    // often opened to join it, so that happens immediately rather than
    // requiring an expand-then-tap-Join round trip.
    if (meetingLink) window.open(meetingLink, "_blank", "noopener,noreferrer");
    if (expandable) setExpanded((v) => !v);
    startTransition(async () => {
      await markNotificationRead(itemId);
      router.refresh();
      refetch();
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    hapticWarning();
    startTransition(async () => {
      const result = kind === "paid" ? await cancelSessionBooking(bookingId) : await cancelBookingRequest(bookingId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setError(null);
        setExpanded(false);
        await markNotificationRead(itemId);
        router.refresh();
        refetch();
      }
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      await dismissNotification(itemId);
      router.refresh();
      refetch();
    });
  }

  return (
    <SwipeToDelete onDelete={handleDismiss} deleteLabel={dict.deleteNotification}>
      <div className={`rounded-2xl border bg-white transition-colors ${read ? "border-brand-100" : "border-brand-300"}`}>
        <button type="button" onClick={handleToggle} className="flex w-full items-center justify-between gap-3 p-5 text-start">
          <div className="flex items-start gap-2">
            {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden />}
            <div>
              <p className={`text-brand-900 ${read ? "font-medium" : "font-semibold"}`}>{title}</p>
              <p className="mt-1 text-sm text-ink/60">{dateTimeLabel}</p>
              {expandable && !expanded && <p className="mt-1 text-xs text-ink/35">{dict.tapToManage}</p>}
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>{statusLabel}</span>
            {expandable && (
              <ChevronDown
                className={`h-4 w-4 text-ink/30 transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            )}
          </div>
        </button>
        {expandable && expanded && (
          <div className="flex flex-col items-start gap-3 border-t border-brand-100 px-5 py-4">
            {href && (
              <Link
                href={href}
                onClick={hapticTap}
                className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {dict.completePayment}
              </Link>
            )}
            {meetingLink && (
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={hapticTap}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <Video className="h-3.5 w-3.5" strokeWidth={2} />
                {dict.joinSession}
              </a>
            )}
            {canCancel && (
              <button
                type="button"
                disabled={pending}
                onClick={handleCancel}
                className="text-xs font-medium text-red-600/80 underline decoration-red-300 underline-offset-2 transition-colors hover:text-red-700 disabled:opacity-50"
              >
                {pending ? dict.cancelling : dict.cancelSession}
              </button>
            )}
          </div>
        )}
      </div>
    </SwipeToDelete>
  );
}
