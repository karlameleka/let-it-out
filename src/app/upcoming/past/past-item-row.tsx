"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { dismissNotification } from "@/lib/notification-read-actions";
import SwipeToDelete from "../swipe-to-delete";
import { useUpcoming } from "@/lib/upcoming-context";
import type { Dictionary } from "@/lib/i18n/dictionary";

/** One swipeable, read-only history row — used for both a past counseling
 * session and a past attended workshop on /upcoming/past. Unlike the live
 * /upcoming rows there's no read/unread state or expandable actions, just
 * a summary and swipe-to-permanently-remove-from-history. */
export default function PastItemRow({
  itemId,
  title,
  dateTimeLabel,
  deleteLabel,
}: {
  itemId: string;
  title: string;
  dateTimeLabel: string;
  deleteLabel: Dictionary["upcoming"]["deleteNotification"];
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { refetch } = useUpcoming();

  function handleDismiss() {
    startTransition(async () => {
      await dismissNotification(itemId);
      router.refresh();
      refetch();
    });
  }

  return (
    <SwipeToDelete onDelete={handleDismiss} deleteLabel={deleteLabel}>
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <p className="font-medium text-brand-900">{title}</p>
        <p className="mt-1 text-sm text-ink/60">{dateTimeLabel}</p>
      </div>
    </SwipeToDelete>
  );
}
