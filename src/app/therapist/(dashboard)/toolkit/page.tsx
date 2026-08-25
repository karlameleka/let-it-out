import Link from "next/link";
import { Phone } from "lucide-react";
import { CLIENT_TOOLS, SESSION_PROMPTS, CRISIS_PROTOCOL } from "@/lib/therapist-toolkit";

export default function TherapistToolkitPage() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-brand-900">Interactive tools to use with clients</h2>
        <p className="mt-1 text-sm text-ink/60">
          The same exercises clients can reach on their own — walk through one together in session, or
          recommend it as homework.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CLIENT_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              target="_blank"
              className="rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
            >
              <p className="font-display font-semibold text-brand-900">{tool.title}</p>
              <p className="mt-1 text-sm text-ink/60">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-brand-900">Session prompts</h2>
        <p className="mt-1 text-sm text-ink/60">Quick starting points — adapt to your own style and this client.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SESSION_PROMPTS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-brand-100 bg-white p-5">
              <p className="font-display font-semibold text-brand-900">{card.title}</p>
              <ul className="mt-3 space-y-2">
                {card.prompts.map((p) => (
                  <li key={p} className="text-sm text-ink/70">&ldquo;{p}&rdquo;</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-display font-semibold text-red-900">Crisis quick reference</h2>
        <a
          href={`tel:${CRISIS_PROTOCOL.hotline}`}
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:underline"
        >
          <Phone className="h-4 w-4" strokeWidth={2} />
          {CRISIS_PROTOCOL.hotlineLabel}: {CRISIS_PROTOCOL.hotline}
        </a>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5">
          {CRISIS_PROTOCOL.steps.map((s) => (
            <li key={s} className="text-sm text-red-900/80">{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
