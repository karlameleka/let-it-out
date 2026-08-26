import { getAllSupportChats } from "@/lib/support-chat-data";
import {
  resolveSupportChat,
  reopenSupportChat,
  deleteSupportChat,
  deleteAllResolvedSupportChats,
} from "@/lib/support-chat-actions";
import type { SupportChatMessage } from "@/lib/ai-support-chat";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

const STATUS_ORDER = { ESCALATED: 0, OPEN: 1, RESOLVED: 2 };

const STATUS_STYLES: Record<string, string> = {
  ESCALATED: "bg-amber-50 text-amber-700",
  OPEN: "bg-brand-50 text-brand-700",
  RESOLVED: "bg-ink/5 text-ink/50",
};

export default async function AdminSupportPage() {
  const chats = await getAllSupportChats();
  const sorted = [...chats].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const resolvedCount = chats.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-brand-900">Live chat</h2>
          <p className="mt-1 text-sm text-ink/60">
            Clients&rsquo; &ldquo;Having technical issues? Live Chat&rdquo; conversations from Account settings. The
            bot only handles app/technical issues — anything psychological gets redirected, never answered.
          </p>
        </div>
        {resolvedCount > 0 && (
          <form action={deleteAllResolvedSupportChats}>
            <ConfirmSubmitButton
              confirmMessage={`Permanently delete all ${resolvedCount} resolved chat${resolvedCount === 1 ? "" : "s"}? This can't be undone.`}
              className="shrink-0 rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Delete all resolved ({resolvedCount})
            </ConfirmSubmitButton>
          </form>
        )}
      </div>

      {sorted.length === 0 && <p className="text-sm text-ink/60">No live chats yet.</p>}

      {sorted.map((chat) => {
        const messages = chat.messages as unknown as SupportChatMessage[];
        const firstMessage = messages.find((m) => m.role === "user")?.content ?? "";
        return (
          <div key={chat.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-brand-800">
                  {chat.user.name} <span className="font-normal text-ink/50">· {chat.user.email}</span>
                </p>
                <p className="mt-0.5 text-xs text-ink/40">
                  {chat.user.accountCode} · Updated {chat.updatedAt.toLocaleString("en-GB")}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[chat.status]}`}>
                {chat.status === "ESCALATED" ? "Needs attention" : chat.status.toLowerCase()}
              </span>
            </div>

            <p className="mt-2 text-sm text-ink/70">{firstMessage.slice(0, 140)}{firstMessage.length > 140 ? "…" : ""}</p>

            <details className="mt-3 group">
              <summary className="cursor-pointer text-sm font-medium text-brand-700">
                Full transcript ({messages.length} message{messages.length === 1 ? "" : "s"})
              </summary>
              <div className="mt-3 space-y-2.5 rounded-xl bg-brand-50/50 p-4">
                {messages.map((m, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      {m.role === "user" ? chat.user.name : "Assistant"}
                    </p>
                    <p className="whitespace-pre-line text-sm text-ink/80">{m.content}</p>
                  </div>
                ))}
              </div>
            </details>

            <div className="mt-4 flex gap-2">
              {chat.status !== "RESOLVED" ? (
                <form action={resolveSupportChat}>
                  <input type="hidden" name="chatId" value={chat.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-brand-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Mark resolved
                  </button>
                </form>
              ) : (
                <form action={reopenSupportChat}>
                  <input type="hidden" name="chatId" value={chat.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-brand-200 px-4 py-1.5 text-xs font-semibold text-ink/60 hover:bg-brand-50"
                  >
                    Reopen
                  </button>
                </form>
              )}
              <a
                href={`mailto:${chat.user.email}`}
                className="rounded-full border border-brand-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                Email client
              </a>
              {chat.status === "RESOLVED" && (
                <form action={deleteSupportChat}>
                  <input type="hidden" name="chatId" value={chat.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Permanently delete this chat transcript? This can't be undone."
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
