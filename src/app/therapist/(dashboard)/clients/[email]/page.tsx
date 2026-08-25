import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { requireCounselor } from "@/lib/therapist-session";
import { getClientProfile, type IntakeAnswerEntry } from "@/lib/therapist-data";
import StatusBadge from "../../../status-badge";
import ToolkitSidebar from "../../../toolkit-sidebar";
import ClientNoteForm from "./note-form";
import ClientNoteItem from "./note-item";

export default async function TherapistClientProfilePage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const session = await requireCounselor();
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  const client = await getClientProfile(session.counselorId, email);
  if (!client) notFound();

  const currentNextSteps = client.notes.find((n) => n.nextSteps)?.nextSteps ?? null;
  const latestIntake = client.intakeSubmissions[0];

  return (
    <div className="space-y-6">
      <Link href="/therapist/clients" className="text-sm font-medium text-brand-600 link-grow">
        ← Back to clients
      </Link>

      <div className="rounded-2xl border border-brand-100 bg-white p-6">
        <h1 className="font-display text-xl font-semibold text-brand-900">{client.name}</h1>
        <p className="text-sm text-ink/60">
          {client.email}
          {client.phone && ` · ${client.phone}`}
        </p>
      </div>

      {currentNextSteps && (
        <div className="rounded-2xl border border-brand-300 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Current next steps</p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-ink/80">{currentNextSteps}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div>
            <h2 className="font-display font-semibold text-brand-900">Intake form</h2>
            {!latestIntake ? (
              <p className="mt-2 text-sm text-ink/60">No intake form submitted yet.</p>
            ) : (
              <div className="mt-3 rounded-2xl border border-brand-100 bg-white p-5">
                <p className="text-xs text-ink/40">
                  Submitted {latestIntake.submittedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {latestIntake.aiSummary && (
                  <div className="mt-3 rounded-xl bg-brand-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">AI-assisted prep summary</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-ink/80">{latestIntake.aiSummary}</p>
                  </div>
                )}
                <details className="mt-4 group">
                  <summary className="cursor-pointer text-sm font-medium text-brand-700">Full intake answers</summary>
                  <div className="mt-3 space-y-3">
                    {(latestIntake.answers as unknown as IntakeAnswerEntry[]).map((a, i) => (
                      <div key={i} className="border-t border-brand-50 pt-3 first:border-t-0 first:pt-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{a.section}</p>
                        <p className="mt-1 text-sm font-medium text-ink/80">{a.label}</p>
                        <p className="mt-0.5 whitespace-pre-line text-sm text-ink/70">{a.value}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display font-semibold text-brand-900">Booking history</h2>
            {client.appointments.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">No bookings yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {client.appointments.map((a) => (
                  <div
                    key={`${a.kind}-${a.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3"
                  >
                    <p className="text-sm text-ink/70">
                      {a.kind} · {a.date}
                      {a.time ? ` at ${a.time}` : ""}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/30 p-1">
            <div className="rounded-xl border-l-4 border-brand-600 bg-white p-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <h2 className="font-display font-semibold text-brand-900">{client.name.split(" ")[0]}&rsquo;s session book</h2>
              </div>
              <p className="mt-1 text-sm text-ink/60">
                One page per session — private to you, never visible to the client or anyone else at Let It Out.
                {client.notes.length > 0 && ` ${client.notes.length} session${client.notes.length === 1 ? "" : "s"} logged.`}
              </p>
              <div className="mt-4">
                <ClientNoteForm clientEmail={client.email} clientName={client.name} />
              </div>
              {client.notes.length > 0 && (
                <div className="mt-4 space-y-3">
                  {client.notes.map((note, i) => (
                    <ClientNoteItem key={note.id} note={note} sessionNumber={client.notes.length - i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <ToolkitSidebar />
      </div>
    </div>
  );
}
