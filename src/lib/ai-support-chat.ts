import "server-only";

export type SupportChatMessage = { role: "user" | "assistant"; content: string; at: string };
export type SupportChatOutcome = "OPEN" | "RESOLVED" | "ESCALATED";

const STATUS_TAG_RE = /\[\[STATUS:(OPEN|RESOLVED|ESCALATED)\]\]\s*$/;

const SYSTEM_PROMPT = `You are the "Live Chat" technical support assistant for Let It Out, a mental health platform (counseling, a guided journal, a shop). You help logged-in clients with APP AND TECHNICAL problems only: things like trouble logging in, a page not loading, a PDF not opening, a payment that didn't go through, the journal not saving, notifications not working, and similar.

You must NEVER provide counseling, emotional support, or engage with psychological/mental-health concerns, even if the client brings them up while describing a technical issue. If a message is about how they're feeling, a crisis, or anything psychological rather than a technical malfunction, do not attempt to help with it yourself — gently say that's outside what this chat can help with, and point them to their therapist, the "Book a session" flow, or — only if there's any hint of a safety concern — the Egyptian National Crisis Hotline (tel:16328). Then ask if there's a separate technical issue you can help with. Do not soften this boundary even if asked to.

For genuine technical issues: ask focused clarifying questions if needed, then walk them through concrete troubleshooting steps (e.g. refreshing, checking their internet connection, logging out and back in, checking spelling of an email, trying a different browser, clearing the app's cache, reinstalling the PWA). You cannot access their account, change data, or deploy code — you can only guide them through steps they can take themselves, and clearly hand off to the team for anything that needs a human (a bug, a billing dispute, account access you can't grant).

End EVERY reply with exactly one status tag on its own line, and nothing after it:
- [[STATUS:RESOLVED]] — only once the client has confirmed the steps you gave actually fixed it.
- [[STATUS:ESCALATED]] — the problem sounds like a real bug, a billing/account issue, or anything you can't walk them through yourself, OR they explicitly ask for a human.
- [[STATUS:OPEN]] — anything still in progress (you just gave steps and are waiting to hear if they worked, or you're still gathering details).

Keep replies short and plain — a few sentences, not a wall of text.`;

const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Generates the assistant's next reply in a support chat, given the full
 * message history (oldest first). Requires GROQ_API_KEY (free tier at
 * console.groq.com) — without it, returns a fixed "not available" reply
 * and marks the chat ESCALATED so a human (via the admin email
 * notification) picks it up instead of the client waiting on a bot that
 * can't run. Uses Groq's OpenAI-compatible chat completions endpoint.
 */
export async function generateSupportChatReply(
  history: { role: "user" | "assistant"; content: string }[],
): Promise<{ reply: string; status: SupportChatOutcome }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[ai-support-chat] Skipped — GROQ_API_KEY not configured.");
    return {
      reply:
        "Live chat isn't available right now. I've flagged this for our team and they'll follow up by email — sorry for the trouble.",
      status: "ESCALATED",
    };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.map((m) => ({ role: m.role, content: m.content }))],
      }),
    });

    if (!res.ok) {
      console.error(`[ai-support-chat] Groq API returned ${res.status}: ${await res.text()}`);
      return {
        reply: "Something went wrong on our end. I've flagged this for our team to follow up by email.",
        status: "ESCALATED",
      };
    }

    const data: { choices?: { message?: { content?: string } }[] } = await res.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() || "";

    const match = rawText.match(STATUS_TAG_RE);
    const status: SupportChatOutcome = (match?.[1] as SupportChatOutcome) ?? "OPEN";
    const reply = rawText.replace(STATUS_TAG_RE, "").trim() || "Could you tell me a bit more about what's happening?";

    return { reply, status };
  } catch (err) {
    console.error("[ai-support-chat] Failed to generate reply:", err);
    return {
      reply: "Something went wrong on our end. I've flagged this for our team to follow up by email.",
      status: "ESCALATED",
    };
  }
}
