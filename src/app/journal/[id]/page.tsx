import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AmbientGlow, Container, Surface, focusRing, motionEase } from "@/components/ui";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: { prompt: true },
  });

  if (!entry || entry.userId !== user.userId) notFound();

  return (
    <div className="relative overflow-hidden">
      <AmbientGlow palette="brand" intensity={0.12} className="h-[30rem]" />
      <Container className="relative max-w-3xl py-20 sm:py-24">
        <Link
          href="/journal/history"
          className={`link-grow inline-block rounded-md text-sm font-medium text-brand-600 ${motionEase} ${focusRing} hover:text-brand-700`}
        >
          &larr; Back to entries
        </Link>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {entry.createdAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {entry.mood && <span className="text-2xl">{entry.mood}</span>}
        </div>

        {entry.prompt && (
          <Surface tone="tinted" className="mt-6 p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
              {entry.prompt.category}
            </p>
            <p className="mt-3 font-display text-lg font-medium italic leading-relaxed tracking-tight text-brand-900">
              {entry.prompt.text}
            </p>
          </Surface>
        )}

        {/* Long-form reading rhythm: looser leading and a comfortable measure,
            because entries are read back slowly rather than scanned. */}
        <p className="prose-longform mt-10 whitespace-pre-line text-base text-ink-body sm:text-lg">
          {entry.content}
        </p>
      </Container>
    </div>
  );
}
