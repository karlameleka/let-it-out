"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { sendSupportChatMessage, submitSupportChatFeedback } from "@/lib/support-chat-actions";
import type { SupportChatMessage } from "@/lib/ai-support-chat";
import { Button } from "@/components/ui";

const GREETING = "Hi, I'm Let It Out technical support assistant. How can I help you today?";

// Matches the [Label](/path) links the assistant is instructed to send for
// service/counselor questions — deliberately restricted to a single leading
// slash (no `//host`, which a browser reads as a scheme-relative URL to a
// different origin) so a link can only ever point somewhere inside this app.
const MESSAGE_LINK_RE = /\[([^\]]+)\]\((\/(?!\/)[a-zA-Z0-9\-/#]*)\)/g;

function renderMessageContent(content: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of content.matchAll(MESSAGE_LINK_RE)) {
    const [full, label, href] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(content.slice(lastIndex, index));
    nodes.push(
      <Link key={key++} href={href} className="font-semibold underline underline-offset-2 hover:opacity-80">
        {label}
      </Link>,
    );
    lastIndex = index + full.length;
  }
  if (lastIndex < content.length) nodes.push(content.slice(lastIndex));
  return nodes;
}

const SAVED_CHAT_KEY = "lio_support_chat_saved";
const SAVED_CHAT_TTL_MS = 24 * 60 * 60 * 1000;

type SavedChat = {
  chatId: string;
  messages: SupportChatMessage[];
  status: "OPEN" | "RESOLVED" | "ESCALATED";
  savedAt: number;
};

type LeaveStep = "confirm" | "resolved" | "rating" | "saved" | null;

function AssistantAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
      <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
    </span>
  );
}

function DialogShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <div className="bg-brand-700 px-6 py-5 text-white">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-brand-100/80">{subtitle}</p>}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function SupportChat() {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [status, setStatus] = useState<"OPEN" | "RESOLVED" | "ESCALATED">("OPEN");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leaveStep, setLeaveStep] = useState<LeaveStep>(null);
  const [leaveResolved, setLeaveResolved] = useState<boolean | null>(null);
  const [leaveRating, setLeaveRating] = useState<number | null>(null);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [pendingHref, setPendingHref] = useState("/account");

  const bottomRef = useRef<HTMLDivElement>(null);

  // The sticky site header's height isn't fixed — it grows at wider
  // breakpoints (md:py-6 vs py-3.5) — so a hardcoded offset clips this
  // page's own header under it on desktop. Measure the real header
  // instead, so this stays correct at every breakpoint and if the site
  // header's height ever changes again.
  const [headerHeight, setHeaderHeight] = useState(73);
  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;
    const updateHeight = () => setHeaderHeight(headerEl.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  // Restore a conversation kept open on this device within the last 24h —
  // read after mount (not as lazy initial state) so server and first client
  // render match, matching the pattern used by the other localStorage-driven
  // gates in this app.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_CHAT_KEY);
      if (!raw) return;
      const saved: SavedChat = JSON.parse(raw);
      if (Date.now() - saved.savedAt < SAVED_CHAT_TTL_MS) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a locally-saved chat on mount, not synchronizing with an external subscription
        setChatId(saved.chatId);
        setMessages(saved.messages);
        setStatus(saved.status);
      } else {
        window.localStorage.removeItem(SAVED_CHAT_KEY);
      }
    } catch {
      // Corrupt or inaccessible storage — just start a fresh chat.
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Catches navigation away from this page via any in-app link — header
  // nav, the bottom tab bar, the footer, the logo — not just our own back
  // button. A capture-phase listener on the document runs before Next's
  // Link intercepts the click, so preventDefault()/stopPropagation() here
  // stops the navigation before it starts; the intended destination is
  // remembered and used once the leave flow finishes.
  useEffect(() => {
    if (!chatId || messages.length === 0 || leaveStep !== null) return;

    function handleDocumentClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === "/support") return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search);
      setLeaveResolved(null);
      setLeaveRating(null);
      setLeaveStep("confirm");
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [chatId, messages.length, leaveStep]);

  // Best-effort coverage for an actual tab close/refresh — a real page
  // unload doesn't run our React code, so only the browser's own generic
  // confirmation is possible here (there's no way to show custom UI).
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!chatId || messages.length === 0 || leaveStep !== null) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [chatId, messages.length, leaveStep]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setPending(true);
    setInput("");
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

  function handleLeaveClick() {
    if (!chatId || messages.length === 0) {
      router.push("/account");
      return;
    }
    setPendingHref("/account");
    setLeaveResolved(null);
    setLeaveRating(null);
    setLeaveStep("confirm");
  }

  function keepChatOpen() {
    try {
      const saved: SavedChat = { chatId: chatId!, messages, status, savedAt: Date.now() };
      window.localStorage.setItem(SAVED_CHAT_KEY, JSON.stringify(saved));
    } catch {
      // Best-effort — worst case the chat just isn't there next visit.
    }
    setLeaveStep("saved");
  }

  function answerResolved(resolved: boolean) {
    setLeaveResolved(resolved);
    setLeaveStep("rating");
  }

  async function finishEndChat(ratingValue: number | null) {
    setLeaveSubmitting(true);
    try {
      window.localStorage.removeItem(SAVED_CHAT_KEY);
    } catch {
      // Ignore — nothing left to clean up if storage isn't available.
    }
    if (chatId && leaveResolved !== null) {
      await submitSupportChatFeedback(chatId, leaveResolved, ratingValue ?? undefined).catch(() => {});
    }
    router.push(pendingHref);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden bg-white"
      style={{ top: headerHeight }}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={handleLeaveClick}
          aria-label="Back to account settings"
          className="rounded-lg p-1.5 text-ink/40 hover:bg-white hover:text-ink/70"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <AssistantAvatar />
        <div>
          <p className="text-sm font-semibold text-brand-900">Technical support chat</p>
          <p className="text-xs text-ink/50">For app/technical issues only — not for how you&rsquo;re feeling.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-brand-50/40 p-4 sm:px-8">
        <div className="flex justify-start">
          <div className="flex max-w-[85%] items-start gap-2 sm:max-w-[70%]">
            <AssistantAvatar />
            <div className="animate-rise rounded-2xl border border-brand-100 bg-white px-3.5 py-2 text-sm text-ink/80 shadow-sm">
              {GREETING}
            </div>
          </div>
        </div>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] items-start gap-2 sm:max-w-[70%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "assistant" && <AssistantAvatar />}
              <div
                className={`animate-rise whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-brand-700 text-white"
                    : "border border-brand-100 bg-white text-ink/80 shadow-sm"
                }`}
              >
                {renderMessageContent(m.content)}
              </div>
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <AssistantAvatar />
              <div className="flex items-center gap-1 rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-300" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {status === "RESOLVED" && (
        <p className="shrink-0 border-t border-brand-100 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-700 sm:px-8">
          Marked as resolved — keep chatting if you need anything else, or head back whenever you&rsquo;re ready.
        </p>
      )}
      {status === "ESCALATED" && (
        <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 sm:px-8">
          This has been flagged for our team — they&rsquo;ll follow up by email if needed.
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-brand-100 bg-white p-3 sm:px-8"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the issue…"
          disabled={pending}
          className="flex-1 rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 disabled:opacity-60"
        />
        <Button type="submit" disabled={pending || !input.trim()} className="!rounded-full !px-4 !py-2.5 text-sm">
          <Send className="h-4 w-4" strokeWidth={2} />
        </Button>
      </form>
      {error && <p className="shrink-0 px-3 pb-3 text-xs text-red-600 sm:px-8">{error}</p>}

      {leaveStep === "confirm" && (
        <DialogShell title="Before you go" subtitle="Do you want to end this chat, or keep it open?">
          <div className="flex flex-col gap-2.5">
            <Button type="button" onClick={keepChatOpen} variant="bright" className="w-full">
              Keep it open
            </Button>
            <Button type="button" onClick={() => setLeaveStep("resolved")} variant="outline" className="w-full">
              End chat
            </Button>
            <button
              type="button"
              onClick={() => setLeaveStep(null)}
              className="mt-1 text-center text-sm font-medium text-ink/50 hover:text-ink/70"
            >
              Never mind, stay here
            </button>
          </div>
        </DialogShell>
      )}

      {leaveStep === "resolved" && (
        <DialogShell title="Did this solve your problem?" subtitle="Quick question before you end the chat.">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => answerResolved(true)}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-brand-200 py-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              <ThumbsUp className="h-5 w-5" strokeWidth={2} />
              Yes
            </button>
            <button
              type="button"
              onClick={() => answerResolved(false)}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-brand-200 py-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              <ThumbsDown className="h-5 w-5" strokeWidth={2} />
              No
            </button>
          </div>
        </DialogShell>
      )}

      {leaveStep === "rating" && (
        <DialogShell title="Rate this chat" subtitle="Optional — helps us improve.">
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLeaveRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="p-1"
              >
                <Star
                  className={`h-7 w-7 ${leaveRating && n <= leaveRating ? "fill-brand-500 text-brand-500" : "text-ink/20"}`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => finishEndChat(leaveRating)}
            variant="bright"
            disabled={leaveSubmitting}
            className="mt-5 w-full"
          >
            {leaveSubmitting ? "Ending chat…" : "Submit & leave"}
          </Button>
          <button
            type="button"
            onClick={() => finishEndChat(null)}
            disabled={leaveSubmitting}
            className="mt-2 w-full text-center text-sm font-medium text-ink/50 hover:text-ink/70"
          >
            Skip rating
          </button>
        </DialogShell>
      )}

      {leaveStep === "saved" && (
        <DialogShell title="Chat kept open" subtitle="You can pick up right where you left off.">
          <p className="text-sm text-ink/70">
            This conversation is saved on this device for 24 hours. Come back to Live Chat before then to continue
            it.
          </p>
          <Button type="button" onClick={() => router.push(pendingHref)} variant="bright" className="mt-5 w-full">
            Got it
          </Button>
        </DialogShell>
      )}
    </div>
  );
}
