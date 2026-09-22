"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { toggleResourceComplete } from "@/lib/client-resources-actions";
import ReframingTool from "@/components/reframing-tool";
import CbtTypeHistory from "@/components/cbt-type-history";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function ReframingPageClient({
  itemId,
  isDone,
  dict,
  historyDict,
  typeLabel,
  locale,
}: {
  itemId: string;
  isDone: boolean;
  dict: Dictionary["reframingTool"];
  historyDict: Dictionary["cbtHistoryModal"];
  typeLabel: string;
  locale: Locale;
}) {
  const [showHistory, setShowHistory] = useState(false);

  function markDone() {
    const fd = new FormData();
    fd.set("itemId", itemId);
    void toggleResourceComplete(fd);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
        >
          <History className="h-3.5 w-3.5" strokeWidth={2} />
          {historyDict.historyButton}
        </button>
      </div>
      <ReframingTool dict={dict} locale={locale} onComplete={isDone ? undefined : markDone} />
      {showHistory && (
        <CbtTypeHistory
          type="reframing"
          typeLabel={typeLabel}
          dict={historyDict}
          locale={locale}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
