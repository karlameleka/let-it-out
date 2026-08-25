"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead, dismissNotification } from "@/lib/notification-read-actions";
import RSVPButtons from "./rsvp-buttons";
import SwipeToDelete from "./swipe-to-delete";
import { useUpcoming } from "@/lib/upcoming-context";
import { hapticTap } from "@/lib/haptics";
import { Video } from "lucide-react";
import type { RSVPStatus } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function EventRow({
  itemId,
  eventId,
  title,
  dateTimeLabel,
  description,
  myRsvp,
  read,
  meetingLink,
  dict,
}: {
  itemId: string;
  eventId: string;
  title: string;
  dateTimeLabel: string;
  description: string | null;
  myRsvp: RSVPStatus | null;
  read: boolean;
  meetingLink?: string | null;
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
      <div
        onClick={handleOpen}
        className={`rounded-2xl border bg-white p-5 transition-colors ${read ? "border-brand-100" : "border-brand-300"}`}
      >
        <div className="flex items-start gap-2">
          {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden />}
          <div>
            <p className={`text-brand-900 ${read ? "font-medium" : "font-semibold"}`}>{title}</p>
            <p className="mt-1 text-sm text-ink/60">{dateTimeLabel}</p>
            {description && <p className="mt-2 text-sm text-ink/70">{description}</p>}
          </div>
        </div>
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <RSVPButtons eventId={eventId} current={myRsvp} dict={dict} />
          {myRsvp === "ATTENDING" && meetingLink && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={hapticTap}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Video className="h-3.5 w-3.5" strokeWidth={2} />
              {dict.joinSession}
            </a>
          )}
        </div>
      </div>
    </SwipeToDelete>
  );
}
