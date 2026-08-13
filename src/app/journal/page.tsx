import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getTodayPrompt } from "@/lib/prompts";
import { prisma } from "@/lib/db";
import { Container, Eyebrow } from "@/components/ui";
import EntryForm from "./entry-form";

export const metadata: Metadata = { title: "Your Journal" };

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [prompt, entries] = await Promise.all([
    getTodayPrompt(),
    prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <Container className="py-16 sm:py-20">
      <Eyebrow>A self-exploration journey</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-bold text-brand-900">
        Hi {user.name.split(" ")[0]}, today&apos;s prompt
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-500">
              {prompt?.category ?? "Reflection"}
            </p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">
              {prompt?.text ?? "What's on your mind today?"}
            </p>
          </div>

          <EntryForm promptId={prompt?.id} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-brand-800">Recent entries</h2>
            <Link href="/journal/history" className="text-sm font-medium text-brand-600 hover:underline">
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
                    className="block rounded-xl border border-brand-100 bg-white p-4 hover:border-brand-300"
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
