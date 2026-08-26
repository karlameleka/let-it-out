"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Star, X } from "lucide-react";
import { sendSupportChatMessage, submitSupportChatFeedback } from "@/lib/support-chat-actions";
import type { SupportChatMessage } from "@/lib/ai-support-chat";
import { Button } from "@/components/ui";

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [status, setStatus] = useState<"OPEN" | "RESOLVED" | "ESCALATED">("OPEN");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setPending(true);
    setInput("");
    // A new message means any prior resolution is back up for debate — let
    // the feedback prompt reappear if the bot marks it resolved again.
    setFeedbackGiven(false);
    setRating(null);
    setMessages((prev) => [...prev, { role: "user", content: text, at: new Date().toISOString() }]);

    const result = await sendSupportChatMessage(chatId, text);
    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setChatId(result.chatId);
    setMessages(result.messages);
    setStatus(result.status);
  }

  async function handleFeedback(resolved: boolean) {
    if (!chatId || feedbackSubmitting) return;
    setFeedbackSubmitting(true);
    await submitSupportChatFeedback(chatId, resolved, rating ?? undefined);
    setFeedbackSubmitting(false);
    setFeedbackGiven(true);
    if (!resolved) setStatus("ESCALATED");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
        Having technical issues? Live Chat
      </button>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white">
      <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-brand-900">Technical support chat</p>
          <p className="text-xs text-ink/50">For app/technical issues only — not for how you&rsquo;re feeling.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="rounded-lg p-1.5 text-ink/40 hover:bg-white hover:text-ink/70"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="max-h-80 min-h-40 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-ink/50">
            Tell us what&rsquo;s going wrong — e.g. a page won&rsquo;t load, a payment failed, a PDF won&rsquo;t open.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
                m.role === "user" ? "bg-brand-700 text-white" : "bg-brand-50 text-ink/80"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {pending && <p className="text-xs text-ink/40">Typing…</p>}
        <div ref={bottomRef} />
      </div>

      {status === "RESOLVED" && !feedbackGiven && (
        <div className="border-t border-brand-100 bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold text-brand-800">Did this solve your problem?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleFeedback(true)}
              disabled={feedbackSubmitting}
              className="rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
            >
              👍 Yes, that fixed it
            </button>
            <button
              type="button"
              onClick={() => handleFeedback(false)}
              disabled={feedbackSubmitting}
              className="rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
            >
              👎 No, still stuck
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[11px] text-ink/50">Rate this chat:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="p-0.5"
              >
                <Star
                  className={`h-3.5 w-3.5 ${rating && n <= rating ? "fill-brand-500 text-brand-500" : "text-ink/20"}`}
                  strokeWidth={1.75}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {status === "RESOLVED" && feedbackGiven && (
        <p className="border-t border-brand-100 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-700">
          Thanks for the feedback! Still having trouble? Just send another message.
        </p>
      )}
      {status === "ESCALATED" && (
        <p className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
          This has been flagged for our team — they&rsquo;ll follow up by email if needed.
        </p>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-brand-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the issue…"
          disabled={pending}
          className="flex-1 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 disabled:opacity-60"
        />
        <Button type="submit" disabled={pending || !input.trim()} className="!px-4 !py-2 text-sm">
          <Send className="h-4 w-4" strokeWidth={2} />
        </Button>
      </form>
      {error && <p className="px-3 pb-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
