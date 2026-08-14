import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";
import { Container, Eyebrow } from "@/components/ui";
import { Swash } from "@/components/decor";
import JournalLockGate from "@/components/journal-lock-gate";
import NewEntryClient from "./new-entry-client";

export const metadata: Metadata = { title: "New Entry" };

export default async function NewJournalEntryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prompt = await getNextPrompt(user.userId);

  return (
    <JournalLockGate>
      <Container className="max-w-2xl py-16 sm:py-20">
        <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
          &larr; Back to journal
        </Link>
        <Eyebrow>New entry</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-900">
          What&apos;s on your{" "}
          <span className="mark-swash italic text-brand-700">
            mind<Swash />
          </span>
          ?
        </h1>
        <div className="mt-8">
          <NewEntryClient initialPrompt={prompt} />
        </div>
      </Container>
    </JournalLockGate>
  );
}
