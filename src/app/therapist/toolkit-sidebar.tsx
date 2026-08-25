import Link from "next/link";
import { Phone, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { CLIENT_TOOLS, CRISIS_PROTOCOL } from "@/lib/therapist-toolkit";
import PdfOpenButton from "@/components/pdf-open-button";

/** Condensed version of /therapist/toolkit for use alongside a specific
 * client — this counselor's personalized toolbox (defaults minus anything
 * they've hidden, plus anything they've added), not the full
 * session-prompt reference. Self-contained: fetches its own data so
 * callers don't need to thread counselor state through. */
export default async function ToolkitSidebar() {
  const session = await requireCounselor();
  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { hiddenDefaultTools: true, toolkitItems: { orderBy: { createdAt: "desc" } } },
  });
  const visibleDefaults = CLIENT_TOOLS.filter((t) => !counselor?.hiddenDefaultTools.includes(t.key));
  const toolkitItems = counselor?.toolkitItems ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <p className="font-display font-semibold text-brand-900">Guiding tools</p>
        <div className="mt-3 space-y-2">
          {visibleDefaults.map((tool) => (
            <Link
              key={tool.key}
              href={tool.href}
              target="_blank"
              className="block rounded-xl border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              {tool.title}
            </Link>
          ))}
          {toolkitItems.map((item) =>
            item.kind === "PDF" && item.fileData ? (
              <PdfOpenButton
                key={item.id}
                fileData={item.fileData}
                fileName={item.fileName ?? "document.pdf"}
                className="flex w-full items-center gap-1.5 rounded-xl border border-brand-100 px-3 py-2 text-left text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                {item.title}
              </PdfOpenButton>
            ) : (
              <a
                key={item.id}
                href={item.url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-brand-100 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                {item.title}
              </a>
            ),
          )}
        </div>
        <Link href="/therapist/toolkit" className="mt-3 inline-block text-xs font-semibold text-brand-600 link-grow">
          Manage your toolbox →
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
