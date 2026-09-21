"use client";

import { useActionState, useState } from "react";
import { assignReframingTool } from "@/lib/therapist-actions";
import type { TherapistClient } from "@/lib/therapist-data";
import { Button } from "@/components/ui";

export default function SendReframingForm({ clients }: { clients: TherapistClient[] }) {
  const [state, formAction, pending] = useActionState(assignReframingTool, undefined);
  const [clientEmail, setClientEmail] = useState("");

  if (clients.length === 0) {
    return <p className="mt-3 text-xs text-ink/40">You&rsquo;ll be able to send this once you have a client.</p>;
  }

  const clientName = clients.find((c) => c.email === clientEmail)?.name ?? "";

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <input type="hidden" name="clientName" value={clientName} />
      <select
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="">Choose a client…</option>
        {clients.map((c) => (
          <option key={c.email} value={c.email}>{c.name || c.email}</option>
        ))}
      </select>
      <Button type="submit" disabled={pending || !clientEmail} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Sending…" : "Send to client"}
      </Button>
      {state?.success && <p className="w-full text-xs font-medium text-brand-700">Sent.</p>}
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
