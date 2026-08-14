"use client";

import { useEffect, useState } from "react";
import { getArticleProgress } from "@/lib/article-progress";

export default function ArticleProgressBadge({
  slug,
  totalMilestones,
}: {
  slug: string;
  totalMilestones: number;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(getArticleProgress(slug).completed.length);
  }, [slug]);

  if (!count) return null;

  const isComplete = count >= totalMilestones;
  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isComplete ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"
      }`}
    >
      {isComplete ? "Completed" : "In progress"}
    </span>
  );
}
