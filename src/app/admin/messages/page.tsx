import { prisma } from "@/lib/db";
import { deleteContactMessage } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-sm text-ink/60">No messages yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-brand-800">{m.subject}</p>
              <p className="text-sm text-ink/60">{m.name} · {m.email}</p>
            </div>
            <form action={deleteContactMessage}>
              <input type="hidden" name="id" value={m.id} />
              <ConfirmSubmitButton
                confirmMessage="Delete this message permanently? This can't be undone."
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
          <p className="mt-2 text-sm text-ink/70">{m.message}</p>
          <p className="mt-1 text-xs text-ink/40">{m.createdAt.toLocaleString("en-GB")}</p>
        </div>
      ))}
    </div>
  );
}
