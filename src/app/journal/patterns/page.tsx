import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import JournalLockGate from "@/components/journal-lock-gate";
import PatternsClient from "./patterns-client";

export const metadata: Metadata = { title: "Mood Patterns" };

export default async function MoodPatternsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lockEnabled = await getJournalLockEnabled(user.userId);

  return (
    <JournalLockGate enabled={lockEnabled}>
      <PatternsClient />
    </JournalLockGate>
  );
}
