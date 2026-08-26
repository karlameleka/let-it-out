import "server-only";

// Egypt hasn't observed DST since 2016, so this is a fixed offset — same
// assumption the rest of the app already makes for booking times (plain
// Egypt-local values, never run through a timezone library).
const EGYPT_UTC_OFFSET_HOURS = 2;

/**
 * Vercel Cron schedules are fixed at deploy time (vercel.json) and can't be
 * changed from the dashboard, so both notification crons instead run every
 * hour and use this to no-op unless the current hour matches the
 * admin-configured send hour (stored as Egypt-local in SiteSettings). This
 * is what actually makes the schedule "editable from the dashboard".
 */
export function isScheduledHourNow(targetHourEgyptLocal: number): boolean {
  const nowUtcHour = new Date().getUTCHours();
  const targetUtcHour = ((targetHourEgyptLocal - EGYPT_UTC_OFFSET_HOURS) % 24 + 24) % 24;
  return nowUtcHour === targetUtcHour;
}
