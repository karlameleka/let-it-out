import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";

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
    <Container className="py-16 sm:py-20">
      <Link href="/journal/history" className="text-sm font-medium text-brand-600 hover:underline">
        &larr; Back to entries
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-ink/50">
          {entry.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        {entry.mood && <span className="text-2xl">{entry.mood}</span>}
      </div>

      {entry.prompt && (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {entry.prompt.category}
          </p>
          <p className="mt-1 font-display font-medium text-brand-900">{entry.prompt.text}</p>
        </div>
      )}

      <p className="mt-6 whitespace-pre-line text-ink/80 leading-relaxed">{entry.content}</p>
    </Container>
  );
}
