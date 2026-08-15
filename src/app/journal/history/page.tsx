import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  ButtonLink,
  Container,
  EmptyState,
  Eyebrow,
  surfaceClass,
} from "@/components/ui";
import { OpenJournalMark } from "@/components/illustrations";

export const metadata: Metadata = { title: "Journal History" };

export default async function JournalHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative overflow-hidden">
      <AmbientGlow palette="brand" intensity={0.12} className="h-[34rem]" />
      <Container className="relative py-20 sm:py-24">
        <Eyebrow>Your archive</Eyebrow>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-brand-900 sm:text-4xl">
          Your entries
        </h1>
        {entries.length > 0 && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} so far
            — every one of them a page you showed up for.
          </p>
        )}

        {entries.length === 0 ? (
          <EmptyState
            className="mt-12 max-w-2xl"
            illustration={<OpenJournalMark className="h-9 w-9" />}
            title="Nothing in the archive yet"
            description="Your saved entries collect here so you can look back and notice what's shifted. It starts with one prompt and a few honest sentences."
            action={<ButtonLink href="/journal">Write your first entry</ButtonLink>}
          />
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className="animate-rise-in"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <Link href={`/journal/${e.id}`} className={`block p-6 ${surfaceClass()}`}>
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-faint">
                    <span className="font-semibold uppercase tracking-[0.12em]">
                      {e.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {e.mood && <span className="text-base">{e.mood}</span>}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-body">
                    {e.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
