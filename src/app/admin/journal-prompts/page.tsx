import { prisma } from "@/lib/db";
import { createJournalPrompt, updateJournalPrompt, deleteJournalPrompt } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import PromptForm from "./prompt-form";

export default async function AdminJournalPromptsPage() {
  const prompts = await prisma.journalPrompt.findMany({ orderBy: { dayNumber: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-900">Journal prompts</h1>
        <p className="mt-1 text-sm text-ink/60">
          {prompts.length} prompt{prompts.length === 1 ? "" : "s"}, shown to a client one at a time (by day
          number, oldest unused first) when they start a new journal entry — see /journal/new.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">Add a prompt</h2>
        <div className="mt-4">
          <PromptForm action={createJournalPrompt} submitLabel="Add prompt" />
        </div>
      </div>

      <div className="space-y-2">
        {prompts.map((p) => (
          <details key={p.id} className="group rounded-2xl border border-brand-100 bg-white p-5 open:border-brand-300">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  Day {p.dayNumber} · {p.category}
                </p>
                <p className="mt-1 truncate text-sm text-ink/70">{p.text}</p>
              </div>
              <span className="shrink-0 text-xl leading-none text-brand-400 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="mt-4 space-y-4 border-t border-brand-50 pt-4">
              <PromptForm action={updateJournalPrompt} prompt={p} submitLabel="Save changes" />
              <form action={deleteJournalPrompt}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmSubmitButton
                  confirmMessage={`Delete the day ${p.dayNumber} prompt? This can be undone from Recently Deleted for 24 hours.`}
                  className="text-xs font-medium text-ink/40 hover:text-red-600"
                >
                  Delete this prompt
                </ConfirmSubmitButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
