"use client";

import { toggleResourceComplete } from "@/lib/client-resources-actions";
import ReframingTool from "@/components/reframing-tool";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function ReframingPageClient({
  itemId,
  isDone,
  dict,
  locale,
}: {
  itemId: string;
  isDone: boolean;
  dict: Dictionary["reframingTool"];
  locale: Locale;
}) {
  function markDone() {
    const fd = new FormData();
    fd.set("itemId", itemId);
    void toggleResourceComplete(fd);
  }

  return <ReframingTool dict={dict} locale={locale} onComplete={isDone ? undefined : markDone} />;
}
