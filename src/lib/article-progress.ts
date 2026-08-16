export type ArticleProgress = {
  /** Milestone keys reached so far, e.g. "section-0", "checkin-0", "section-1". */
  completed: string[];
  /** The option text picked at each check-in, indexed the same as
   * `article.checkIns`; null for any not yet answered. */
  checkInAnswers: (string | null)[];
};

const EMPTY: ArticleProgress = { completed: [], checkInAnswers: [] };

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
      checkInAnswers: Array.isArray(parsed.checkInAnswers) ? parsed.checkInAnswers : [],
    };
  } catch {
    return EMPTY;
  }
}

export function saveArticleProgress(slug: string, progress: ArticleProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(slug), JSON.stringify(progress));
}

export function clearArticleProgress(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(slug));
}
