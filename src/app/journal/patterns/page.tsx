import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import JournalLockGate from "@/components/journal-lock-gate";
import PatternsClient from "./patterns-client";

export const metadata: Metadata = { title: "Mood Patterns" };

export default async function MoodPatternsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <JournalLockGate>
      <PatternsClient />
    </JournalLockGate>
  );
}
