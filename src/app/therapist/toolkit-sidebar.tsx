import Link from "next/link";
import { Phone } from "lucide-react";
import { CLIENT_TOOLS, CRISIS_PROTOCOL } from "@/lib/therapist-toolkit";

/** Condensed version of /therapist/toolkit for use alongside a specific
 * client — quick links, not the full session-prompt reference. */
export default function ToolkitSidebar() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <p className="font-display font-semibold text-brand-900">Guiding tools</p>
        <div className="mt-3 space-y-2">
          {CLIENT_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              target="_blank"
              className="block rounded-xl border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              {tool.title}
            </Link>
          ))}
        </div>
        <Link href="/therapist/toolkit" className="mt-3 inline-block text-xs font-semibold text-brand-600 link-grow">
          More session prompts →
        </Link>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-display font-semibold text-red-900">In crisis?</p>
        <a
          href={`tel:${CRISIS_PROTOCOL.hotline}`}
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:underline"
        >
          <Phone className="h-4 w-4" strokeWidth={2} />
          {CRISIS_PROTOCOL.hotlineLabel}: {CRISIS_PROTOCOL.hotline}
        </a>
        <Link href="/therapist/toolkit" className="mt-2 block text-xs font-semibold text-red-700 link-grow">
          Full crisis protocol →
        </Link>
      </div>
    </div>
  );
}
