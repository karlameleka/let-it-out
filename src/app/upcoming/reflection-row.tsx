"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { markNotificationRead, dismissNotification } from "@/lib/notification-read-actions";
import SwipeToDelete from "./swipe-to-delete";
import { useUpcoming } from "@/lib/upcoming-context";
import { hapticTap } from "@/lib/haptics";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ReflectionRow({
  itemId,
  title,
  body,
  cta,
  read,
  dict,
}: {
  itemId: string;
  title: string;
  body: string;
  cta: string;
  read: boolean;
  dict: Dictionary["upcoming"];
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { refetch } = useUpcoming();

  function handleOpen() {
    hapticTap();
    startTransition(async () => {
      await markNotificationRead(itemId);
      router.refresh();
      refetch();
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
      <Link
        href="/journal/reflection"
        onClick={handleOpen}
        className={`flex items-start gap-3 rounded-2xl border bg-white p-5 transition-colors ${read ? "border-brand-100" : "border-brand-300"}`}
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <NotebookPen className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-2">
            {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden />}
            <p className={`text-brand-900 ${read ? "font-medium" : "font-semibold"}`}>{title}</p>
          </div>
          <p className="mt-1 text-sm text-ink/60">{body}</p>
          <p className="mt-2 text-xs font-medium text-brand-600">{cta}</p>
        </div>
      </Link>
    </SwipeToDelete>
  );
}
