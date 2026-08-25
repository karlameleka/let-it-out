"use client";

import { useState } from "react";
import { acknowledgeReferral } from "@/lib/therapist-actions";
import type { ReferralIntakeSnapshot, ReferralNotesSnapshotEntry } from "@/lib/therapist-data";

type ReferralRow = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  reason: string;
  type: "FULL_REFERRAL" | "COLLABORATE";
  status: "PENDING" | "ACKNOWLEDGED";
  createdAt: Date;
  acknowledgedAt: Date | null;
  intakeSnapshot: unknown;
  notesSnapshot: unknown;
};

const TYPE_LABELS: Record<ReferralRow["type"], string> = {
  FULL_REFERRAL: "Full referral",
  COLLABORATE: "Collaborate",
};

function ReferralCard({
  referral,
  counterpartLabel,
  showAcknowledge,
}: {
  referral: ReferralRow;
  counterpartLabel: string;
  showAcknowledge: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const intake = referral.intakeSnapshot as ReferralIntakeSnapshot | null;
  const notes = referral.notesSnapshot as ReferralNotesSnapshotEntry[] | null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-brand-900">{referral.clientName}</p>
          <p className="text-xs text-ink/50">{counterpartLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {TYPE_LABELS[referral.type]}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              referral.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-ink/5 text-ink/50"
            }`}
          >
            {referral.status === "PENDING" ? "Pending review" : "Acknowledged"}
          </span>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-ink/80">{referral.reason}</p>
      <p className="mt-2 text-xs text-ink/40">
        {referral.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      {(intake || (notes && notes.length > 0)) && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            {expanded ? "Hide shared info" : "View shared info"}
          </button>
          {expanded && (
            <div className="mt-3 space-y-3 rounded-xl bg-brand-50/50 p-4">
              {intake && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Intake form</p>
                  {intake.aiSummary && <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{intake.aiSummary}</p>}
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs font-medium text-brand-700">Full answers</summary>
                    <div className="mt-2 space-y-2">
                      {intake.answers.map((a, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium text-ink/80">{a.label}</p>
                          <p className="text-ink/70">{a.value}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
              {notes && notes.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                    Session notes ({notes.length})
                  </p>
                  <div className="mt-1.5 space-y-2.5">
                    {notes.map((n, i) => (
                      <div key={i} className="border-t border-brand-100 pt-2 first:border-t-0 first:pt-0">
                        <p className="text-xs text-ink/40">
                          {new Date(n.sessionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="mt-0.5 whitespace-pre-line text-sm text-ink/80">{n.notes}</p>
                        {n.nextSteps && <p className="mt-1 text-sm text-ink/60">Next steps: {n.nextSteps}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAcknowledge && referral.status === "PENDING" && (
        <form action={acknowledgeReferral} className="mt-4">
          <input type="hidden" name="referralId" value={referral.id} />
          <button
            type="submit"
            className="rounded-full border border-brand-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            Mark reviewed
          </button>
        </form>
      )}
    </div>
  );
}

export default function ReferralTabs({
  received,
  sent,
}: {
  received: (ReferralRow & { fromCounselor: { name: string } })[];
  sent: (ReferralRow & { toCounselor: { name: string } })[];
}) {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const pendingCount = received.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "received" ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/60 hover:bg-brand-50"
          }`}
        >
          Received{pendingCount > 0 && ` (${pendingCount})`}
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "sent" ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/60 hover:bg-brand-50"
          }`}
        >
          Sent
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {tab === "received" &&
          (received.length === 0 ? (
            <p className="text-sm text-ink/60">No referrals received yet.</p>
          ) : (
            received.map((r) => (
              <ReferralCard key={r.id} referral={r} counterpartLabel={`From ${r.fromCounselor.name}`} showAcknowledge />
            ))
          ))}
        {tab === "sent" &&
          (sent.length === 0 ? (
            <p className="text-sm text-ink/60">No referrals sent yet.</p>
          ) : (
            sent.map((r) => (
              <ReferralCard key={r.id} referral={r} counterpartLabel={`To ${r.toCounselor.name}`} showAcknowledge={false} />
            ))
          ))}
      </div>
    </div>
  );
}
