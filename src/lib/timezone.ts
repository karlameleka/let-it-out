import "server-only";
import { cookies } from "next/headers";
import { CAIRO_TIME_ZONE, TIMEZONE_COOKIE } from "@/lib/timezone-constants";

export {
  CAIRO_TIME_ZONE,
  TIMEZONE_COOKIE,
  zonedParts,
  todayInTimeZone,
  minutesSinceMidnightInTimeZone,
  addDaysToDateStr,
  zonedTimeToUtc,
} from "@/lib/timezone-constants";

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The visitor's own device timezone (e.g. "Africa/Cairo", "Europe/London"),
 * for anything that's about *that specific person* rather than the shared
 * business calendar — currently just the signup minimum-age gate. Falls
 * back to CAIRO_TIME_ZONE if the cookie hasn't been set yet. The one thing
 * in this file that actually needs next/headers — everything else lives in
 * timezone-constants.ts so client components (and server modules reachable
 * from them, like date-range.ts) can use the rest of this without pulling
 * next/headers into a client bundle. */
export async function getUserTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  const tz = cookieStore.get(TIMEZONE_COOKIE)?.value;
  return tz && isValidTimeZone(tz) ? tz : CAIRO_TIME_ZONE;
}
