import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { moodLabel } from "@/lib/moods";
import { MoodDot } from "@/components/mood-dot";

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
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link
        href="/journal/history"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow"
      >
        &larr; Back to entries
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-brand-50 px-6 py-4 sm:px-8">
          <p className="text-sm font-medium text-brand-700">
            {entry.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {entry.mood && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-700">{moodLabel(entry.mood)}</span>
              <MoodDot mood={entry.mood} size="md" />
            </div>
          )}
        </div>

        <div className="px-6 py-8 sm:px-8">
          {entry.prompt && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {entry.prompt.category}
              </p>
              <p className="mt-1 font-display font-medium italic text-brand-900">{entry.prompt.text}</p>
            </div>
          )}

          <p className="mt-6 whitespace-pre-line font-display text-lg leading-relaxed text-ink/80">
            {entry.content}
          </p>
        </div>
      </div>
    </Container>
  );
}
