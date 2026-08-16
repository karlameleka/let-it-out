import "server-only";

/**
 * Summarizes a client's intake-form answers for the assigned therapist —
 * key themes, risk flags worth double-checking, and a few workflow/direction
 * ideas for the first session. Requires ANTHROPIC_API_KEY; without it this
 * quietly returns null and the therapist email just ships the raw answers,
 * same graceful-fallback pattern as this codebase's other optional
 * integrations (Google sign-in, email sending).
 *
 * To enable: create a key at https://console.anthropic.com/settings/keys
 * and set ANTHROPIC_API_KEY in the environment.
 */
export async function generateIntakeInsights(
  answers: { section: string; label: string; value: string }[],
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[ai-insights] Skipped — ANTHROPIC_API_KEY not configured.");
    return null;
  }

  const transcript = answers.map((a) => `[${a.section}] ${a.label}\n${a.value}`).join("\n\n");

  const prompt = `You are assisting a licensed psychotherapist in preparing for a new client's first session. Below is that client's intake form. Write a concise clinical-prep summary for the therapist with these sections:

1. Key themes — 2-4 bullet points on what stands out.
2. Risk flags to confirm — anything from the safety questions worth double-checking in person (only include this section if something in the answers warrants it; otherwise state "No specific risk flags surfaced, but always confirm safety directly.").
3. Possible therapy direction — 2-3 bullet points on modalities or focus areas that might fit, framed as ideas for the therapist to consider, not a diagnosis.
4. Suggested first-session opener — one or two sentences.

Keep it under 250 words, clinical but plain-spoken, and never present this as a diagnosis — you are surfacing patterns for a licensed professional to evaluate, not making clinical determinations yourself.

INTAKE FORM:
${transcript}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error(`[ai-insights] Anthropic API returned ${res.status}: ${await res.text()}`);
      return null;
    }

    const data: { content?: { type: string; text?: string }[] } = await res.json();
    const text = data.content?.find((c) => c.type === "text")?.text;
    return text?.trim() || null;
  } catch (err) {
    console.error("[ai-insights] Failed to generate insights:", err);
    return null;
  }
}
