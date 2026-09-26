"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { dismissNotification } from "@/lib/notification-read-actions";
import SwipeToDelete from "../swipe-to-delete";
import { useUpcoming } from "@/lib/upcoming-context";
import { hapticTap } from "@/lib/haptics";
import type { Dictionary } from "@/lib/i18n/dictionary";

/** One swipeable, read-only history row — used for both a past counseling
 * session and a past attended workshop on /upcoming/past. Unlike the live
 * /upcoming rows there's no read/unread state or expandable actions — just
 * a summary, swipe-to-permanently-remove-from-history, and (for a past
 * counseling session) a tap straight through to the between-session
 * reflection sheet via `href`. */
export default function PastItemRow({
  itemId,
  title,
  dateTimeLabel,
  deleteLabel,
  href,
  cta,
  cancelledLabel,
  cannotDeleteDict,
}: {
  itemId: string;
  title: string;
  dateTimeLabel: string;
  deleteLabel: Dictionary["upcoming"]["deleteNotification"];
  /** Present only for a past counseling session that actually happened —
   * links to /journal/reflection. Omitted for a cancelled session, since
   * there's nothing to reflect on. */
  href?: string;
  cta?: string;
  /** Set only for a session cancelled from either side — shows a badge
   * instead of the reflection prompt/link, and also gates the swipe (see
   * cannotDeleteDict below). */
  cancelledLabel?: string;
  /** Cancelled sessions stay in past notifications for 30 days and can't
   * be individually deleted — swiping one shows this explanation instead
   * of dismissing it. Only needed (and only passed) when cancelledLabel
   * is set. */
  cannotDeleteDict?: {
    title: Dictionary["upcoming"]["cannotDeleteCancelledTitle"];
    body: Dictionary["upcoming"]["cannotDeleteCancelledBody"];
    ok: Dictionary["upcoming"]["cannotDeleteCancelledOk"];
  };
}) {
  const [, startTransition] = useTransition();
  const [showCannotDelete, setShowCannotDelete] = useState(false);
  const router = useRouter();
  const { refetch } = useUpcoming();

  function handleDismiss() {
    startTransition(async () => {
      await dismissNotification(itemId);
      router.refresh();
      refetch();
    });
  }

  function blockDelete(): Promise<boolean> {
    setShowCannotDelete(true);
    return Promise.resolve(false);
  }

  const content = (
    <>
      <div>
        <p className="font-medium text-brand-900">{title}</p>
        <p className="mt-1 text-sm text-ink/60">{dateTimeLabel}</p>
        {cancelledLabel ? (
          <span className="mt-2 inline-block rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/50">
            {cancelledLabel}
          </span>
        ) : (
          href && cta && <p className="mt-2 text-xs font-medium text-brand-600">{cta}</p>
        )}
      </div>
      {href && <ChevronRight className="h-4 w-4 shrink-0 text-ink/30 rtl:-scale-x-100" strokeWidth={2} />}
    </>
  );

  return (
    <>
    <SwipeToDelete
      onDelete={handleDismiss}
      confirmBeforeDelete={cancelledLabel ? blockDelete : undefined}
      deleteLabel={deleteLabel}
    >
      {href ? (
        <Link
          href={href}
          onClick={hapticTap}
          className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300 active:border-brand-300"
        >
          {content}
        </Link>
      ) : (
        <div className="rounded-2xl border border-brand-100 bg-white p-5">{content}</div>
      )}
    </SwipeToDelete>
    {showCannotDelete && cannotDeleteDict && (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-sm animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
          <div className="px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-brand-900">{cannotDeleteDict.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{cannotDeleteDict.body}</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowCannotDelete(false)}
                className="w-full rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-600"
              >
                {cannotDeleteDict.ok}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
