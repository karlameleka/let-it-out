import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";
import { getJournalStats } from "@/lib/journal-stats";
import { prisma } from "@/lib/db";
import { Container, Eyebrow, ButtonLink } from "@/components/ui";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import EntryForm from "./entry-form";
import JournalReminderToggle from "@/components/journal-reminder-toggle";

export const metadata: Metadata = { title: "Your Journal" };

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Get a daily prompt",
    description: "A fresh, rotating prompt each time — no blank page to stare at.",
  },
  {
    step: "2",
    title: "Write freely",
    description: "A few sentences or a full page — there's no right answer, and it's private.",
  },
  {
    step: "3",
    title: "Build your streak",
    description: "Look back on old entries anytime and watch your self-reflection habit grow.",
  },
];

export default async function JournalPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <section className="bg-brand-50 py-16 sm:py-20">
          <Container>
            <Ribbon>Free journaling app</Ribbon>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
              Let it out,{" "}
              <span className="mark-swash italic text-brand-700">
                one page<Swash />
              </span>{" "}
              at a time.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-ink/70">
              A free, guided journaling space with rotating daily prompts —
              no pressure, no perfect entries, just a little time for
              yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/signup">Start journaling — it&apos;s free</ButtonLink>
              <ButtonLink href="/login" variant="outline">
                Log in
              </ButtonLink>
            </div>
          </Container>
        </section>

        <WaveDivider fill="fill-white" />

        <section className="py-12 sm:py-16">
          <Container>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              How it works
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-semibold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-brand-900">{item.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </>
    );
  }

  const [prompt, entries, stats] = await Promise.all([
    getNextPrompt(user.userId),
    prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getJournalStats(user.userId),
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

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
          🔥 {stats.streak}-day streak
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
          📝 {stats.total} {stats.total === 1 ? "entry" : "entries"} so far
        </span>
        <Link
          href="/journal/patterns"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          📊 Mood patterns
        </Link>
        <JournalReminderToggle />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EntryForm initialPrompt={prompt} />
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
