"use client";

import { useRouter } from "next/navigation";
import EntryForm from "../entry-form";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

type Prompt = { id: string; category: string; text: string } | null;

export default function NewEntryClient({
  userId,
  initialPrompt,
  initialMode,
  initialMoods,
  dict,
  moodPickerDict,
  locale,
}: {
  userId: string;
  initialPrompt: Prompt;
  initialMode?: "prompt" | "free";
  initialMoods?: string[];
  dict: Dictionary["entryForm"];
  moodPickerDict: Dictionary["moodPicker"];
  locale: Locale;
}) {
  const router = useRouter();

  return (
    <EntryForm
      userId={userId}
      initialPrompt={initialPrompt}
      initialMode={initialMode}
      initialMoods={initialMoods}
      dict={dict}
      moodPickerDict={moodPickerDict}
      locale={locale}
      onSaved={() => {
        // The onboarding checklist's "journal" step lives in the root
        // layout, which router.push alone won't re-fetch — without this,
        // it keeps showing unchecked until some unrelated navigation
        // happens to force a refresh.
        router.refresh();
        setTimeout(() => router.push("/journal"), 900);
      }}
    />
  );
}
