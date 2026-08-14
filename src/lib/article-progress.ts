export type ArticleProgress = {
  /** Milestone keys reached so far, e.g. "section-0", "checkin", "section-1". */
  completed: string[];
  /** The option text picked at the check-in, if answered. */
  checkInAnswer: string | null;
};

const EMPTY: ArticleProgress = { completed: [], checkInAnswer: null };

function storageKey(slug: string) {
  return `lio_article_progress_${slug}`;
}

export function getArticleProgress(slug: string): ArticleProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      checkInAnswer: typeof parsed.checkInAnswer === "string" ? parsed.checkInAnswer : null,
    };
  } catch {
    return EMPTY;
  }
}

export function saveArticleProgress(slug: string, progress: ArticleProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(slug), JSON.stringify(progress));
}
