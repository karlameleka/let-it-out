import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";

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
      <h1 className="font-display text-3xl font-semibold text-brand-900">Your entries</h1>

      {entries.length === 0 ? (
        <p className="mt-6 text-ink/60">
          No entries yet.{" "}
          <Link href="/journal" className="font-medium text-brand-600 hover:underline">
            Write your first one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/journal/${e.id}`}
                className="block rounded-xl border-2 border-brand-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-ink/50">
                  <span>{e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {e.mood && <span className="text-base">{e.mood}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink/80">{e.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
