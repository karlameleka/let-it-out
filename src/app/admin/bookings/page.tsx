import { prisma } from "@/lib/db";
import { deleteBookingRequest } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import SessionBookingEditForm from "./session-booking-edit-form";
import BookingRequestEditForm from "./booking-request-edit-form";

export default async function AdminBookingsPage() {
  const [sessionBookings, bookings, counselors] = await Promise.all([
    prisma.sessionBooking.findMany({ orderBy: { createdAt: "desc" }, include: { counselor: true } }),
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, include: { counselor: true } }),
    prisma.counselor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Paid sessions <span className="text-sm font-normal text-ink/40">({sessionBookings.length})</span>
        </h2>
        <p className="mt-1 text-sm text-ink/60">Sessions booked and paid for through the in-app flow.</p>
        <div className="mt-4 space-y-4">
          {sessionBookings.length === 0 && <p className="text-sm text-ink/60">No paid sessions yet.</p>}
          {sessionBookings.map((b) => (
            <div key={b.id} className="flex flex-wrap items-start gap-4 rounded-2xl border border-brand-100 bg-white p-5">
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-brand-800">{b.name}</p>
                <p className="text-sm text-ink/60">{b.email} · {b.phone}</p>
                <p className="mt-1 text-sm text-ink/70">
                  With <strong>{b.counselor.name}</strong> · {b.priceEGP - b.discountEGP} EGP
                </p>
                <p className="text-sm text-ink/70">
                  {b.preferredDate}{b.preferredTime ? ` at ${b.preferredTime}` : ""} · {b.status.replaceAll("_", " ")}
                </p>
                {b.meetingLink && (
                  <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-brand-600 link-grow">
                    {b.meetingLink}
                  </a>
                )}
                <p className="mt-1 text-xs text-ink/40">{b.createdAt.toLocaleString("en-GB")}</p>
                <SessionBookingEditForm
                  booking={{
                    id: b.id,
                    name: b.name,
                    email: b.email,
                    phone: b.phone,
                    counselorId: b.counselorId,
                    preferredDate: b.preferredDate,
                    preferredTime: b.preferredTime,
                    status: b.status,
                    meetingLink: b.meetingLink,
                  }}
                  counselors={counselors}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Booking requests <span className="text-sm font-normal text-ink/40">({bookings.length})</span>
        </h2>
        <p className="mt-1 text-sm text-ink/60">Manual requests from the free-form request flow.</p>
        <div className="mt-4 space-y-4">
          {bookings.length === 0 && <p className="text-sm text-ink/60">No booking requests yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display font-semibold text-brand-800">{b.name}</p>
                  <p className="text-sm text-ink/60">{b.email} · {b.phone}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    With <strong>{b.counselor.name}</strong> · {b.sessionType.replaceAll("_", " ")}
                  </p>
                  <p className="text-sm text-ink/70">
                    Preferred: {b.preferredDate} at {b.preferredTime} · {b.status}
                  </p>
                  {b.message && <p className="mt-2 text-sm text-ink/60">&ldquo;{b.message}&rdquo;</p>}
                  {b.meetingLink && (
                    <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-brand-600 link-grow">
                      {b.meetingLink}
                    </a>
                  )}
                  <p className="mt-1 text-xs text-ink/40">{b.createdAt.toLocaleString("en-GB")}</p>
                </div>
                <form action={deleteBookingRequest}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Delete this booking request permanently? This can't be undone."
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
              <div className="mt-3">
                <BookingRequestEditForm
                  booking={{
                    id: b.id,
                    name: b.name,
                    email: b.email,
                    phone: b.phone,
                    counselorId: b.counselorId,
                    preferredDate: b.preferredDate,
                    preferredTime: b.preferredTime,
                    sessionType: b.sessionType,
                    status: b.status,
                    message: b.message,
                    meetingLink: b.meetingLink,
                  }}
                  counselors={counselors}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
