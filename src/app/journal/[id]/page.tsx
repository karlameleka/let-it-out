import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import JournalLockGate from "@/components/journal-lock-gate";
import EntryDetailClient from "./entry-detail-client";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const lockEnabled = await getJournalLockEnabled(user.userId);

  return (
    <JournalLockGate enabled={lockEnabled}>
      <EntryDetailClient id={id} />
    </JournalLockGate>
  );
}
