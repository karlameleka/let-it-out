"use client";

import { useActionState } from "react";
import { Video } from "lucide-react";
import { setMeetingLink, type MeetingLinkFormState } from "@/lib/therapist-actions";

export default function MeetingLinkForm({
  bookingId,
  bookingKind,
  clientEmail,
  currentLink,
}: {
  bookingId: string;
  bookingKind: "paid" | "request";
  clientEmail: string;
  currentLink: string | null;
}) {
  const [state, formAction, pending] = useActionState<MeetingLinkFormState, FormData>(setMeetingLink, undefined);

  return (
    <form action={formAction} className="mt-3 border-t border-brand-50 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Video className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="bookingKind" value={bookingKind} />
        <input type="hidden" name="clientEmail" value={clientEmail} />
        <input
          type="url"
          name="meetingLink"
          defaultValue={currentLink ?? ""}
          placeholder="Meeting link (e.g. https://meet.google.com/...)"
          className="min-w-0 flex-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {pending ? "Saving…" : currentLink ? "Update" : "Save & notify"}
        </button>
      </div>
      {state?.error && <p className="mt-1.5 text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-1.5 text-xs text-brand-600">Saved — the client has been emailed the link.</p>}
    </form>
  );
}
