/** Shared page size for every paginated admin list — see admin-pagination.tsx
 * for the Prev/Next control. Keeping one constant means every list crashes
 * (or rather, doesn't) the same way under load: bounded query, bounded
 * render, regardless of how many rows actually exist in the table. */
export const ADMIN_PAGE_SIZE = 50;

/** Parses a `?page=` search param into a safe positive integer, defaulting
 * to 1 for anything missing, non-numeric, or out of range. */
export function parseAdminPage(pageParam: string | undefined): number {
  const n = Number(pageParam);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
