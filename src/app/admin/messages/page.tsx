import { prisma } from "@/lib/db";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-sm text-ink/60">No messages yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="font-display font-semibold text-brand-800">{m.subject}</p>
          <p className="text-sm text-ink/60">{m.name} · {m.email}</p>
          <p className="mt-2 text-sm text-ink/70">{m.message}</p>
          <p className="mt-1 text-xs text-ink/40">{m.createdAt.toLocaleString("en-GB")}</p>
        </div>
      ))}
    </div>
  );
}
