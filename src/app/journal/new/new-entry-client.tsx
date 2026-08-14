"use client";

import { useRouter } from "next/navigation";
import EntryForm from "../entry-form";

type Prompt = { id: string; category: string; text: string } | null;

export default function NewEntryClient({ initialPrompt }: { initialPrompt: Prompt }) {
  const router = useRouter();

  return (
    <EntryForm
      initialPrompt={initialPrompt}
      onSaved={() => {
        setTimeout(() => router.push("/journal"), 900);
      }}
    />
  );
}
