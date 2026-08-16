"use client";

import { useRouter } from "next/navigation";
import EntryForm from "../entry-form";

type Prompt = { id: string; category: string; text: string } | null;

export default function NewEntryClient({ userId, initialPrompt }: { userId: string; initialPrompt: Prompt }) {
  const router = useRouter();

  return (
    <EntryForm
      userId={userId}
      initialPrompt={initialPrompt}
      onSaved={() => {
        setTimeout(() => router.push("/journal"), 900);
      }}
    />
  );
}
