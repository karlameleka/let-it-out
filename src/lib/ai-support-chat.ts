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

Be brief and to the point in every reply: 1–3 short sentences, plain language, no preamble ("I understand", "Thank you for reaching out", "I'm sorry to hear that"), no restating the problem back, no sign-offs. If you're giving troubleshooting steps, list at most 2–3 as a tight numbered list — never a long explanation. Ask only one clarifying question at a time. Get straight to the point.

If the client asks about services, counselors, pricing, or where to find something in the app, include exactly one relevant link formatted as [Label](/path), using ONLY these internal paths — never any other URL, and never more than one per reply: [Our services](/services), [Book a counselor](/counseling), [Guided journals](/shop), [Open your journal](/journal), [Help articles](/resources). Only include a link when it's genuinely relevant to what they asked — don't force one into every reply.`;

// gemini-2.5-flash returned 404 "no longer available to new users" on this
// API key — Google's own error redirected back to gemini-3.6-flash. That
// leaves gemini-3.6-flash as the only model confirmed to actually process
// requests here (it hit a 429 rate limit, not an auth/model-not-found
// error — meaning requests do reach it, just capped at 20/day on the free
// tier). Until billing is enabled on this Gemini API project (which
// removes the daily cap) or Google raises the free allotment, this model
// is the one that works, with that 20/day ceiling as the known tradeoff.
const GEMINI_MODEL = "gemini-3.6-flash";

/**
 * Generates the assistant's next reply in a support chat, given the full
 * message history (oldest first). Requires GEMINI_API_KEY (free tier at
 * aistudio.google.com/apikey) — without it, returns a fixed "not available"
 * reply and marks the chat ESCALATED so a human (via the admin email
 * notification) picks it up instead of the client waiting on a bot that
 * can't run. Uses the Gemini API's generateContent endpoint.
 */
export async function generateSupportChatReply(
  history: { role: "user" | "assistant"; content: string }[],
): Promise<{ reply: string; status: SupportChatOutcome }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[ai-support-chat] Skipped — GEMINI_API_KEY not configured.");
    return {
      reply:
        "Live chat isn't available right now. I've flagged this for our team and they'll follow up by email — sorry for the trouble.",
      status: "ESCALATED",
    };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          // Gemini uses "model" rather than "assistant" for the bot's own turns.
          contents: history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          // Brevity is enforced by the prompt, not this ceiling — cutting
          // this too low (previously 200) risks the API hard-stopping
          // mid-sentence before the reply, or the trailing status tag, is
          // finished.
          //
          // thinkingLevel: "minimal" keeps this model's internal
          // "thinking" step as short as possible. Thinking tokens are
          // drawn from the same maxOutputTokens budget as the visible
          // reply and take extra generation time — for a short, direct
          // support-bot answer that doesn't need multi-step reasoning,
          // that's mostly overhead.
          //
          // IMPORTANT: this must be `thinkingLevel`, not `thinkingBudget`
          // — thinkingBudget is the legacy field from the Gemini 2.5
          // series. Gemini 3 models (gemini-3.6-flash included) reject a
          // request carrying thinkingBudget with a 400 error. Sending the
          // wrong field for a model's generation breaks the request
          // entirely — this app has now hit that in both directions, so
          // double-check this matches GEMINI_MODEL's generation before
          // ever changing either one again.
          generationConfig: { maxOutputTokens: 800, thinkingConfig: { thinkingLevel: "minimal" } },
        }),
      },
    );

    if (!res.ok) {
      console.error(`[ai-support-chat] Gemini API (model: ${GEMINI_MODEL}) returned ${res.status}: ${await res.text()}`);
      return {
        reply: "Something went wrong on our end. I've flagged this for our team to follow up by email.",
        status: "ESCALATED",
      };
    }

    const data: { candidates?: { content?: { parts?: { text?: string }[] } }[] } = await res.json();
    const rawText = (data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "").trim();

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
