"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

const CHARS = "ACDEFGHJKLMNPQRTUVWXY346789"; // no 0/O, 1/I/L/S/B — easy to misread

function generateCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

/**
 * A tiny, fully client-side "type this code" challenge — stands in for
 * Cloudflare Turnstile on the counseling booking forms, where a user
 * reported the "Verifying…" wait (Turnstile's widget loading over the
 * network) was too noticeable on mobile. This has no network dependency at
 * all, so there's nothing to wait for: the code exists the instant the
 * component mounts.
 *
 * Not a defense against a targeted attacker (nothing short of Turnstile is),
 * only against the unsophisticated scripted spam the honeypot field already
 * targets — screenSubmission's honeypot + rate-limit checks still run
 * alongside this either way. The plaintext expected value travels in a
 * hidden field the server compares the typed answer against; a bot that
 * doesn't render the page won't know to mirror it.
 */
export default function SimpleCaptcha({ dict }: { dict: Dictionary["forms"] }) {
  // Generated after mount, not in the initial render — Math.random() during
  // SSR would bake one code into the server-rendered HTML and produce a
  // different one on the client's first render pass, a hydration mismatch.
  const [code, setCode] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(generateCode());
  }, []);

  return (
    <div className="flex items-end gap-3">
      <div>
        <p className="mb-1 text-xs font-medium text-ink/60">{dict.captchaLabel}</p>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="select-none rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 font-mono text-base font-bold tracking-[0.3em] text-brand-800"
            style={{ textDecoration: "line-through", textDecorationColor: "rgba(30,91,115,0.25)", textDecorationThickness: "1.5px" }}
          >
            {code}
          </span>
          <button
            type="button"
            onClick={() => setCode(generateCode())}
            aria-label={dict.captchaRefresh}
            title={dict.captchaRefresh}
            className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-brand-50 hover:text-brand-600"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
      <input type="hidden" name="captchaExpected" value={code} />
      <input
        type="text"
        name="captchaAnswer"
        required
        maxLength={5}
        autoComplete="off"
        autoCapitalize="characters"
        placeholder={dict.captchaPlaceholder}
        className="w-24 rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-brand-500"
      />
    </div>
  );
}
