"use client";

import { toggleResourceComplete } from "@/lib/client-resources-actions";
import ThoughtRecordTool from "@/components/thought-record-tool";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function ThoughtRecordPageClient({
  itemId,
  isDone,
  dict,
  locale,
}: {
  itemId: string;
  isDone: boolean;
  dict: Dictionary["thoughtRecord"];
  locale: Locale;
}) {
  function markDone() {
    const fd = new FormData();
    fd.set("itemId", itemId);
    void toggleResourceComplete(fd);
  }

  return <ThoughtRecordTool dict={dict} locale={locale} onComplete={isDone ? undefined : markDone} />;
}
