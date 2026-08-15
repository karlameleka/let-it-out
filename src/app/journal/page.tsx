import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";
import { getJournalStats } from "@/lib/journal-stats";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  Eyebrow,
  Surface,
  surfaceClass,
} from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { PenMark } from "@/components/illustrations";
import EntryForm from "./entry-form";

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
        <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-28">
          <AmbientGlow palette="brand" intensity={0.2} />
          <DoodleField />
          <Container className="relative">
            <Ribbon>Free journaling app</Ribbon>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.14] tracking-tight text-brand-900 sm:text-[3.4rem]">
              Let it out,{" "}
              <span className="mark-swash italic text-brand-700">
                one page<Swash />
              </span>{" "}
              at a time.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-body">
              A free, guided journaling space with rotating daily prompts —
              no pressure, no perfect entries, just a little time for
              yourself.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/signup" size="lg">
                Start journaling — it&apos;s free
              </ButtonLink>
              <ButtonLink href="/login" variant="outline" size="lg">
                Log in
              </ButtonLink>
            </div>
          </Container>
        </section>


        <section className="py-16 sm:py-20">
          <Container>
            <Eyebrow>How it works</Eyebrow>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <Surface key={item.step} className="flex gap-5 p-7">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-brand-600 to-brand-700 font-display text-sm font-semibold text-white shadow-ambient-sm">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-display font-semibold tracking-tight text-brand-900">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </Surface>
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
    <div className="relative overflow-hidden">
      <AmbientGlow palette="brand" intensity={0.12} className="h-[42rem]" />
      <Container className="relative py-20 sm:py-24">
        <Eyebrow>A self-exploration journey</Eyebrow>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-brand-900 sm:text-4xl">
          Hi {user.name.split(" ")[0]}, here&apos;s a{" "}
          <span className="mark-swash italic text-brand-700">
            new prompt<Swash />
          </span>
        </h1>

        <div className="mt-7 flex flex-wrap gap-3">
          <Badge className="px-4 py-2 text-sm">🔥 {stats.streak}-day streak</Badge>
          <Badge className="px-4 py-2 text-sm">
            📝 {stats.total} {stats.total === 1 ? "entry" : "entries"} so far
          </Badge>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <EntryForm initialPrompt={prompt} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-brand-900">
                Recent entries
              </h2>
              <Link
                href="/journal/history"
                className="link-grow text-sm font-medium text-brand-600"
              >
                View all
              </Link>
            </div>

            {entries.length === 0 ? (
              <EmptyState
                className="mt-5"
                illustration={<PenMark className="h-9 w-9" />}
                title="Your first page is waiting"
                description="Nothing saved yet — write a line or two on today's prompt and it will show up right here, ready to look back on."
                action={
                  <ButtonLink href="#entry-content" size="sm">
                    Write today&apos;s entry
                  </ButtonLink>
                }
              />
            ) : (
              <ul className="mt-5 space-y-3">
                {entries.map((e, i) => (
                  <li
                    key={e.id}
                    className="animate-rise-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Link
                      href={`/journal/${e.id}`}
                      className={`block p-5 ${surfaceClass()}`}
                    >
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
                      <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-body">
                        {e.content}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
