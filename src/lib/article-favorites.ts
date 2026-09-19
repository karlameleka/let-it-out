// Device-only favorites for Resources articles — same localStorage-only
// pattern as article-progress.ts, since Resources is browsable without an
// account and this is a lightweight personalization, not account data.
const STORAGE_KEY = "lio_article_favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function getFavoriteArticleSlugs(): string[] {
  return read();
}

export function isArticleFavorited(slug: string): boolean {
  return read().includes(slug);
}

/** Flips the favorite state for `slug` and returns the new full list. */
export function toggleArticleFavorite(slug: string): string[] {
  const current = read();
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  write(next);
  return next;
}
