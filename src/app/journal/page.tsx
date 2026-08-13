import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";
import { prisma } from "@/lib/db";
import { Container, Eyebrow } from "@/components/ui";
import { Swash } from "@/components/decor";
import EntryForm from "./entry-form";

export const metadata: Metadata = { title: "Your Journal" };

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [prompt, entries] = await Promise.all([
    getNextPrompt(user.userId),
    prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <Container className="py-16 sm:py-20">
      <Eyebrow>A self-exploration journey</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold text-brand-900">
        Hi {user.name.split(" ")[0]}, here&apos;s a{" "}
        <span className="mark-swash italic text-brand-700">
          new prompt<Swash />
        </span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              {prompt?.category ?? "Reflection"}
            </p>
            <p data-testid="journal-prompt-text" className="mt-2 font-display text-xl font-medium italic text-brand-900">
              {prompt?.text ?? "What's on your mind today?"}
            </p>
          </div>

          <EntryForm promptId={prompt?.id} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-brand-900">Recent entries</h2>
            <Link href="/journal/history" className="text-sm font-medium text-brand-600 link-grow">
              View all
            </Link>
          </div>

          {entries.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              Your entries will show up here once you save your first one.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {entries.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/journal/${e.id}`}
                    className="block rounded-xl border-2 border-brand-100 bg-white p-4 transition-colors hover:border-brand-300"
                  >
                    <div className="flex items-center justify-between text-xs text-ink/50">
                      <span>{e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {e.mood && <span>{e.mood}</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/80">{e.content}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
}
