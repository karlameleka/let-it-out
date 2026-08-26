import "server-only";
import { prisma } from "@/lib/db";
import { GENDERS, REFERRAL_SOURCES } from "@/lib/content/geo";

// A single-pageview session (or several logged in the same instant) has a
// zero measured span even though the person was actually reading that
// page — credit a minimum dwell time instead of letting it drag averages
// to zero. 30 minutes of inactivity between pageviews starts a new session.
const MIN_DWELL_MS = 20_000;
const SESSION_GAP_MS = 30 * 60 * 1000;

function featureForPath(path: string): string {
  if (path === "/") return "Home";
  if (path.startsWith("/journal")) return "Journal";
  if (path.startsWith("/counseling")) return "Counseling";
  if (path.startsWith("/shop") || path.startsWith("/cart") || path.startsWith("/checkout")) return "Shop";
  if (path.startsWith("/resources")) return "Resources";
  if (path.startsWith("/workshops")) return "Workshops";
  if (path.startsWith("/services")) return "Services";
  if (path.startsWith("/upcoming")) return "Upcoming (sessions & events)";
  if (path.startsWith("/account")) return "Account settings";
  if (path.startsWith("/about")) return "About";
  if (path.startsWith("/contact")) return "Contact";
  if (path.startsWith("/therapist")) return "Therapist portal";
  if (path.startsWith("/admin")) return "Admin";
  return "Other";
}

function bucketAge(birthYear: number | null): string {
  if (!birthYear) return "Not provided";
  const age = new Date().getFullYear() - birthYear;
  if (age < 18) return "Under 18";
  if (age <= 24) return "18–24";
  if (age <= 34) return "25–34";
  if (age <= 44) return "35–44";
  if (age <= 54) return "45–54";
  return "55+";
}

export type BreakdownRow = { label: string; count: number; pct: number };

function toBreakdown(counts: Map<string, number>, total: number): BreakdownRow[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

/** Total accounts, how many signed up in the last 30 days, and journal-lock
 * opt-in as a quick engagement signal alongside them. */
export async function getUserCountStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [total, newLast30, withLockEnabled] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { journalLockEnabled: true } }),
  ]);
  return { total, newLast30, withLockEnabled };
}

/** Breaks the user base down by every demographic collected at signup.
 * `interests` is not mutually exclusive (multi-select), so its percentages
 * are share-of-users, not share-of-total-selections. */
export async function getDemographics() {
  const users = await prisma.user.findMany({
    select: { gender: true, birthYear: true, country: true, referralSource: true, serviceInterests: true },
  });
  const total = users.length;

  const gender = new Map<string, number>();
  const age = new Map<string, number>();
  const country = new Map<string, number>();
  const referral = new Map<string, number>();
  const interests = new Map<string, number>();

  for (const u of users) {
    const g = u.gender && (GENDERS as readonly string[]).includes(u.gender) ? u.gender : "Not provided";
    gender.set(g, (gender.get(g) ?? 0) + 1);

    const a = bucketAge(u.birthYear);
    age.set(a, (age.get(a) ?? 0) + 1);

    const c = u.country || "Not provided";
    country.set(c, (country.get(c) ?? 0) + 1);

    const r = u.referralSource && (REFERRAL_SOURCES as readonly string[]).includes(u.referralSource) ? u.referralSource : "Not provided";
    referral.set(r, (referral.get(r) ?? 0) + 1);

    if (u.serviceInterests.length === 0) {
      interests.set("Not provided", (interests.get("Not provided") ?? 0) + 1);
    } else {
      for (const i of u.serviceInterests) interests.set(i, (interests.get(i) ?? 0) + 1);
    }
  }

  // Fold every country past the top 6 into "Other" so a long tail of
  // one-off signups doesn't turn the chart into an unreadable list.
  const countryBreakdown = toBreakdown(country, total);
  const topCountries = countryBreakdown.slice(0, 6);
  const otherCount = countryBreakdown.slice(6).reduce((sum, c) => sum + c.count, 0);
  if (otherCount > 0) {
    topCountries.push({ label: "Other", count: otherCount, pct: Math.round((otherCount / total) * 100) });
  }

  return {
    total,
    gender: toBreakdown(gender, total),
    age: toBreakdown(age, total),
    country: topCountries,
    referral: toBreakdown(referral, total),
    interests: toBreakdown(interests, total),
  };
}

/** Every logged feature, most-visited first, with total views and unique
 * visitors — the source for "most/least used features". */
export async function getFeatureUsage() {
  const views = await prisma.pageView.findMany({ select: { path: true, userId: true } });
  if (views.length === 0) return { total: 0, features: [] as { label: string; views: number; users: number }[] };

  const featureViews = new Map<string, number>();
  const featureUsers = new Map<string, Set<string>>();

  for (const v of views) {
    const feature = featureForPath(v.path);
    featureViews.set(feature, (featureViews.get(feature) ?? 0) + 1);
    if (!featureUsers.has(feature)) featureUsers.set(feature, new Set());
    featureUsers.get(feature)!.add(v.userId);
  }

  const features = [...featureViews.entries()]
    .map(([label, views]) => ({ label, views, users: featureUsers.get(label)?.size ?? 0 }))
    .sort((a, b) => b.views - a.views);

  return { total: views.length, features };
}

type Session = { start: Date; end: Date };

/** Groups a user's pageview timestamps into sessions, splitting whenever
 * the gap between two consecutive views exceeds SESSION_GAP_MS. */
function sessionize(timestamps: Date[]): Session[] {
  const sorted = [...timestamps].sort((a, b) => a.getTime() - b.getTime());
  const sessions: Session[] = [];
  let start = sorted[0];
  let last = start;
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i];
    if (t.getTime() - last.getTime() > SESSION_GAP_MS) {
      sessions.push({ start, end: last });
      start = t;
    }
    last = t;
  }
  if (start) sessions.push({ start, end: last });
  return sessions;
}

function sessionDurationMs(s: Session): number {
  return Math.max(s.end.getTime() - s.start.getTime(), MIN_DWELL_MS);
}

export type TimeSpentRow = { label: string; avgMinutes: number; sessions: number };

/** Average session length (in minutes), grouped by gender / age bracket /
 * referral source — "time spent on app per group of users". Sessions are
 * inferred from pageview timestamps (see sessionize above), since there's
 * no separate session-tracking table. */
export async function getTimeSpentByGroup() {
  const [views, users] = await Promise.all([
    prisma.pageView.findMany({ select: { userId: true, createdAt: true } }),
    prisma.user.findMany({ select: { id: true, gender: true, birthYear: true, referralSource: true } }),
  ]);

  if (views.length === 0) {
    return { trackedUsers: 0, gender: [] as TimeSpentRow[], age: [] as TimeSpentRow[], referral: [] as TimeSpentRow[] };
  }

  const byUser = new Map<string, Date[]>();
  for (const v of views) {
    if (!byUser.has(v.userId)) byUser.set(v.userId, []);
    byUser.get(v.userId)!.push(v.createdAt);
  }
  const userById = new Map(users.map((u) => [u.id, u]));

  function accumulate(keyFn: (u: (typeof users)[number]) => string): TimeSpentRow[] {
    const totalMs = new Map<string, number>();
    const sessionCount = new Map<string, number>();
    for (const [userId, timestamps] of byUser) {
      const user = userById.get(userId);
      if (!user) continue;
      const key = keyFn(user);
      const sessions = sessionize(timestamps);
      const ms = sessions.reduce((sum, s) => sum + sessionDurationMs(s), 0);
      totalMs.set(key, (totalMs.get(key) ?? 0) + ms);
      sessionCount.set(key, (sessionCount.get(key) ?? 0) + sessions.length);
    }
    return [...totalMs.entries()]
      .map(([label, ms]) => {
        const sessions = sessionCount.get(label) ?? 0;
        return { label, avgMinutes: sessions ? Math.round((ms / sessions / 60000) * 10) / 10 : 0, sessions };
      })
      .sort((a, b) => b.avgMinutes - a.avgMinutes);
  }

  return {
    trackedUsers: byUser.size,
    gender: accumulate((u) => (u.gender && (GENDERS as readonly string[]).includes(u.gender) ? u.gender : "Not provided")),
    age: accumulate((u) => bucketAge(u.birthYear)),
    referral: accumulate((u) =>
      u.referralSource && (REFERRAL_SOURCES as readonly string[]).includes(u.referralSource) ? u.referralSource : "Not provided",
    ),
  };
}
