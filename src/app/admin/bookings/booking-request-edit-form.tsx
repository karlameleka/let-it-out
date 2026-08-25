"use client";

import { useActionState, useState } from "react";
import { updateBookingRequestFull, type BookingRequestEditFormState } from "@/lib/admin-actions";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
const SESSION_TYPES = ["INDIVIDUAL_COUNSELING", "COUPLES_COUNSELING", "FOLLOW_UP", "OTHER"];

const inputClass = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-ink/60";

export default function BookingRequestEditForm({
  booking,
  counselors,
}: {
  booking: {
    id: string;
    name: string;
    email: string;
    phone: string;
    counselorId: string;
    preferredDate: string;
    preferredTime: string;
    sessionType: string;
    status: string;
    message: string | null;
    meetingLink: string | null;
  };
  counselors: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BookingRequestEditFormState, FormData>(updateBookingRequestFull, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        Edit
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 w-full space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <input type="hidden" name="bookingId" value={booking.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" defaultValue={booking.name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={booking.email} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" defaultValue={booking.phone} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Counselor</label>
          <select name="counselorId" defaultValue={booking.counselorId} className={inputClass}>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input name="preferredDate" type="date" defaultValue={booking.preferredDate} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <input name="preferredTime" type="time" defaultValue={booking.preferredTime} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Session type</label>
          <select name="sessionType" defaultValue={booking.sessionType} className={inputClass}>
            {SESSION_TYPES.map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" defaultValue={booking.status} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Meeting link (optional)</label>
          <input
            name="meetingLink"
            type="url"
            defaultValue={booking.meetingLink ?? ""}
            placeholder="https://meet.google.com/..."
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Message (optional)</label>
          <textarea name="message" defaultValue={booking.message ?? ""} rows={2} className={inputClass} />
        </div>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="text-xs text-brand-600">Saved.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-white"
        >
          Close
        </button>
      </div>
    </form>
  );
}
