import Link from "next/link";
import { Phone, Download, X, EyeOff, Eye } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { removeToolkitItem, toggleDefaultTool } from "@/lib/therapist-actions";
import { CLIENT_TOOLS, SESSION_PROMPTS, CRISIS_PROTOCOL } from "@/lib/therapist-toolkit";
import AddToolkitItemForm from "./add-item-form";

export default async function TherapistToolkitPage() {
  const session = await requireCounselor();
  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { hiddenDefaultTools: true, toolkitItems: { orderBy: { createdAt: "desc" } } },
  });
  const hiddenDefaultTools = counselor?.hiddenDefaultTools ?? [];
  const toolkitItems = counselor?.toolkitItems ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-brand-900">Your toolbox</h2>
        <p className="mt-1 text-sm text-ink/60">
          The built-in exercises, plus anything you&rsquo;ve added yourself — links or PDFs. Hide what you
          don&rsquo;t use, add what you do.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CLIENT_TOOLS.map((tool) => {
            const hidden = hiddenDefaultTools.includes(tool.key);
            return (
              <div
                key={tool.key}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-5 ${
                  hidden ? "border-dashed border-brand-100 bg-brand-50/40 opacity-60" : "border-brand-100 bg-white"
                }`}
              >
                <Link href={tool.href} target="_blank" className="min-w-0 flex-1 hover:opacity-80">
                  <p className="font-display font-semibold text-brand-900">{tool.title}</p>
                  <p className="mt-1 text-sm text-ink/60">{tool.description}</p>
                </Link>
                <form action={toggleDefaultTool}>
                  <input type="hidden" name="key" value={tool.key} />
                  <button
                    type="submit"
                    aria-label={hidden ? "Show in toolbox" : "Hide from toolbox"}
                    title={hidden ? "Show in toolbox" : "Hide from toolbox"}
                    className="shrink-0 rounded-lg p-1.5 text-ink/40 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {hidden ? <Eye className="h-4 w-4" strokeWidth={2} /> : <EyeOff className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </form>
              </div>
            );
          })}

          {toolkitItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-5">
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-brand-900">{item.title}</p>
                {item.description && <p className="mt-1 text-sm text-ink/60">{item.description}</p>}
                {item.kind === "PDF" ? (
                  <a
                    href={item.fileData ?? undefined}
                    download={item.fileName ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 link-grow"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={2} />
                    Open / Download PDF
                  </a>
                ) : (
                  <a
                    href={item.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-brand-600 link-grow"
                  >
                    Open link →
                  </a>
                )}
              </div>
              <form action={removeToolkitItem}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  aria-label="Remove from toolbox"
                  title="Remove from toolbox"
                  className="shrink-0 rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AddToolkitItemForm />
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
