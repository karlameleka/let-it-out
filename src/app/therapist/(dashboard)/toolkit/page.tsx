import Link from "next/link";
import { Phone, Download, X, EyeOff, Eye, Brain } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { removeToolkitItem, toggleDefaultTool, updateSessionPrompts } from "@/lib/therapist-actions";
import { getOwnCounselorWithBookings, deriveClients } from "@/lib/therapist-data";
import { CLIENT_TOOLS, SESSION_PROMPTS, CRISIS_PROTOCOL, type PromptCard } from "@/lib/therapist-toolkit";
import AddToolkitItemForm from "./add-item-form";
import SendReframingForm from "./send-reframing-form";
import PdfOpenButton from "@/components/pdf-open-button";
import SessionPromptsEditor from "@/components/session-prompts-editor";

export default async function TherapistToolkitPage() {
  const session = await requireCounselor();
  const [counselor, counselorWithBookings] = await Promise.all([
    prisma.counselor.findUnique({
      where: { id: session.counselorId },
      select: {
        hiddenDefaultTools: true,
        toolkitItems: { orderBy: { createdAt: "desc" } },
        sessionPromptCards: true,
      },
    }),
    getOwnCounselorWithBookings(session.counselorId),
  ]);
  const hiddenDefaultTools = counselor?.hiddenDefaultTools ?? [];
  const toolkitItems = counselor?.toolkitItems ?? [];
  const sessionPrompts = (counselor?.sessionPromptCards as PromptCard[] | null) ?? SESSION_PROMPTS;
  const clients = counselorWithBookings ? deriveClients(counselorWithBookings) : [];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-brand-900">Your toolbox</h2>
        <p className="mt-1 text-sm text-ink/60">
          The built-in exercises, plus anything you&rsquo;ve added yourself, links or PDFs. Hide what you
          don&rsquo;t use, add what you do.
        </p>

        <div className="mt-4 rounded-2xl border-2 border-brand-100 bg-brand-50/40 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700">
              <Brain className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-brand-900">Cognitive Reframing</p>
              <p className="mt-1 text-sm text-ink/60">
                Walks a client through catching, examining, and reframing a stuck thought. Send it to a client and
                they&rsquo;ll play it right on their own My Profile page.
              </p>
              <SendReframingForm clients={clients} />
            </div>
          </div>
        </div>

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
                {item.kind === "PDF" && item.fileData ? (
                  <PdfOpenButton
                    fileData={item.fileData}
                    fileName={item.fileName ?? "document.pdf"}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 link-grow"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={2} />
                    Open / Download PDF
                  </PdfOpenButton>
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
        <p className="mt-1 text-sm text-ink/60">
          Quick starting points, adapt to your own style and this client. Edit freely; this is your own copy,
          not shared with other counselors.
        </p>
        <div className="mt-4">
          <SessionPromptsEditor initialCards={sessionPrompts} defaultCards={SESSION_PROMPTS} action={updateSessionPrompts} />
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
