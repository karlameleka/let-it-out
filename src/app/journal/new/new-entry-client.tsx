"use client";

import { useRouter } from "next/navigation";
import EntryForm from "../entry-form";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

type Prompt = { id: string; category: string; text: string } | null;

export default function NewEntryClient({
  userId,
  initialPrompt,
  dict,
  moodPickerDict,
  locale,
}: {
  userId: string;
  initialPrompt: Prompt;
  dict: Dictionary["entryForm"];
  moodPickerDict: Dictionary["moodPicker"];
  locale: Locale;
}) {
  const router = useRouter();

  return (
    <EntryForm
      userId={userId}
      initialPrompt={initialPrompt}
      dict={dict}
      moodPickerDict={moodPickerDict}
      locale={locale}
      onSaved={() => {
        setTimeout(() => router.push("/journal"), 900);
      }}
    />
  );
}
