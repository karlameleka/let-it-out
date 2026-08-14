import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Container, Eyebrow, ButtonLink } from "@/components/ui";
import { Swash } from "@/components/decor";
import { MoodDot } from "@/components/mood-dot";

export const metadata: Metadata = { title: "Journal History" };

export default async function JournalHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-16 sm:py-20">
      <Eyebrow>A self-exploration journey</Eyebrow>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-brand-900">
          Your{" "}
          <span className="mark-swash italic text-brand-700">
            entries<Swash />
          </span>
        </h1>
        <Link
          href="/journal/patterns"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <BarChart3 className="h-4 w-4" strokeWidth={2} />
          View mood patterns
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-200 bg-white text-brand-500">
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-ink/60">No entries yet — your journal is waiting for its first page.</p>
          <ButtonLink href="/journal" className="mt-6">
            Write your first entry
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/journal/${e.id}`}
                className="block rounded-2xl border-2 border-brand-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    {e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {e.mood && <MoodDot mood={e.mood} />}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-ink/80">{e.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
