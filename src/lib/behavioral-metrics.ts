import "server-only";
import { prisma } from "@/lib/db";
import { rangeForPreset, priorPeriod, percentChange, type DateRange } from "@/lib/date-range";
import { revenueForRange } from "@/lib/dashboard-metrics";
import { featureForPath } from "@/lib/analytics";

// The "value moment" every downstream metric (Activation, TTV) treats as
// proof a user got real use out of the app — whichever of these happens
// first after signup. Journal entries and assessment completions are
// client-local (see journal-actions.ts / assessment-actions.ts), so the
// timestamp here is when the tracking event was recorded, not when the
// underlying row was created server-side.
const VALUE_MOMENT_FILTERS = [
  { object: "JournalEntry", action: "created" },
  { object: "SessionBooking", action: "created" },
  { object: "Assessment", action: "completed" },
] as const;

// Core, standalone product features a user can "adopt" — deliberately
// excludes Home/About/Contact/Account settings/Admin/Therapist portal/Other
// (see featureForPath in analytics.ts), which are navigation or someone
// else's portal, not a feature of the product to discover.
const CORE_FEATURES = [
  "Journal",
  "Counseling",
  "Shop",
  "Resources",
  "Workshops",
  "Services",
  "Upcoming (sessions & events)",
] as const;

/** Staff accounts are excluded from every behavioral metric below —
 * AARRR/HEART/stickiness describe real customer usage, and the one or two
 * admin accounts logging in and QA-browsing daily would otherwise skew
 * DAU/MAU, adoption, and retention. */
async function adminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  return admins.map((a) => a.id);
}

/** Distinct non-admin users with at least one PageView or AnalyticsEvent
 * in `range` — the shared definition of "active" behind stickiness,
 * engagement, and retention. */
async function activeUserIds(range: DateRange, admins: string[]): Promise<Set<string>> {
  const [views, events] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: range.from, lte: range.to }, userId: { notIn: admins } },
      select: { userId: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: range.from, lte: range.to }, userId: { notIn: admins } },
      select: { userId: true },
    }),
  ]);
  const ids = new Set<string>();
  for (const v of views) ids.add(v.userId);
  for (const e of events) if (e.userId) ids.add(e.userId);
  return ids;
}

// ---------- Stickiness (DAU / MAU) ----------

export type StickinessResult = {
  dau: number;
  mau: number;
  stickinessPct: number | null;
  /** Daily active users for the trailing 14 days, oldest first. */
  trend: { date: string; dau: number }[];
};

/** How much of the monthly active base shows up on a given day — the
 * standard proxy for how habit-forming the product actually is.
 * `asOf` anchors both windows (defaults to now). */
export async function getStickiness(asOf: Date = new Date()): Promise<StickinessResult> {
  const admins = await adminUserIds();
  const mauRange = rangeForPreset("30d", asOf);
  const todayRange = rangeForPreset("today", asOf);
  const trendFrom = new Date(todayRange.from.getTime() - 13 * 24 * 60 * 60 * 1000);
  const trendRange: DateRange = { from: trendFrom, to: todayRange.to };

  const [mauIds, trendViews, trendEvents] = await Promise.all([
    activeUserIds(mauRange, admins),
    prisma.pageView.findMany({
      where: { createdAt: { gte: trendRange.from, lte: trendRange.to }, userId: { notIn: admins } },
      select: { userId: true, createdAt: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: trendRange.from, lte: trendRange.to }, userId: { notIn: admins } },
      select: { userId: true, createdAt: true },
    }),
  ]);

  const byDay = new Map<string, Set<string>>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(trendRange.from.getTime() + i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), new Set());
  }
  for (const v of trendViews) byDay.get(v.createdAt.toISOString().slice(0, 10))?.add(v.userId);
  for (const e of trendEvents) if (e.userId) byDay.get(e.createdAt.toISOString().slice(0, 10))?.add(e.userId);

  const trend = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ids]) => ({ date, dau: ids.size }));
  const dau = trend[trend.length - 1]?.dau ?? 0;
  const mau = mauIds.size;

  return {
    dau,
    mau,
    stickinessPct: mau > 0 ? Math.round((dau / mau) * 1000) / 10 : null,
    trend,
  };
}

// ---------- Feature Adoption Depth ----------

export type FeatureAdoptionResult = {
  totalUsers: number;
  totalCoreFeatures: number;
  avgFeaturesAdopted: number;
  /** How many users have adopted exactly N of the core features, N = 0..totalCoreFeatures. */
  distribution: { featuresAdopted: number; users: number; pct: number }[];
  /** Share of all registered users who've touched each individual feature at least once. */
  perFeature: { label: string; users: number; pct: number }[];
};

/** How deeply users explore the product, not just whether they show up —
 * "adopted" means at least one PageView on that feature's pages, ever
 * (all-time, not range-scoped, since depth of exploration accumulates). */
export async function getFeatureAdoptionDepth(): Promise<FeatureAdoptionResult> {
  const admins = await adminUserIds();
  const [totalUsers, views] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.pageView.findMany({ where: { userId: { notIn: admins } }, select: { userId: true, path: true } }),
  ]);

  const byUser = new Map<string, Set<string>>();
  for (const v of views) {
    const feature = featureForPath(v.path);
    if (!(CORE_FEATURES as readonly string[]).includes(feature)) continue;
    if (!byUser.has(v.userId)) byUser.set(v.userId, new Set());
    byUser.get(v.userId)!.add(feature);
  }

  const distributionMap = new Map<number, number>();
  const perFeatureUsers = new Map<string, number>();
  let sumAdopted = 0;
  for (const features of byUser.values()) {
    const count = features.size;
    distributionMap.set(count, (distributionMap.get(count) ?? 0) + 1);
    sumAdopted += count;
    for (const f of features) perFeatureUsers.set(f, (perFeatureUsers.get(f) ?? 0) + 1);
  }
  distributionMap.set(0, Math.max(0, totalUsers - byUser.size));

  const distribution = Array.from({ length: CORE_FEATURES.length + 1 }, (_, featuresAdopted) => {
    const users = distributionMap.get(featuresAdopted) ?? 0;
    return { featuresAdopted, users, pct: totalUsers ? Math.round((users / totalUsers) * 100) : 0 };
  });

  const perFeature = CORE_FEATURES.map((label) => {
    const users = perFeatureUsers.get(label) ?? 0;
    return { label, users, pct: totalUsers ? Math.round((users / totalUsers) * 100) : 0 };
  }).sort((a, b) => b.users - a.users);

  return {
    totalUsers,
    totalCoreFeatures: CORE_FEATURES.length,
    avgFeaturesAdopted: totalUsers ? Math.round((sumAdopted / totalUsers) * 10) / 10 : 0,
    distribution,
    perFeature,
  };
}

// ---------- Time-to-Value ----------

export type TimeToValueResult = {
  totalUsers: number;
  usersReached: number;
  reachedPct: number;
  medianHours: number | null;
  avgHours: number | null;
};

async function firstValueMomentByUser(userIds?: string[]): Promise<Map<string, Date>> {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      OR: VALUE_MOMENT_FILTERS.map((f) => ({ object: f.object, action: f.action })),
      ...(userIds ? { userId: { in: userIds } } : {}),
    },
    select: { userId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const firstAt = new Map<string, Date>();
  for (const e of events) {
    if (!e.userId) continue;
    if (!firstAt.has(e.userId)) firstAt.set(e.userId, e.createdAt);
  }
  return firstAt;
}

/** Time from signup to the first journal entry, session booking, or
 * completed self-assessment — whichever comes first. Only reflects
 * activity since event tracking shipped: an existing user who journaled
 * for months before this table existed shows as "not reached" until their
 * next entry, there's no historical backfill for client-local data. */
export async function getTimeToValue(): Promise<TimeToValueResult> {
  const admins = await adminUserIds();
  const users = await prisma.user.findMany({
    where: { role: "USER", id: { notIn: admins } },
    select: { id: true, createdAt: true },
  });
  const firstValueAt = await firstValueMomentByUser(users.map((u) => u.id));

  const hours: number[] = [];
  for (const u of users) {
    const firstValue = firstValueAt.get(u.id);
    if (!firstValue) continue;
    const diffMs = firstValue.getTime() - u.createdAt.getTime();
    if (diffMs >= 0) hours.push(diffMs / (1000 * 60 * 60));
  }
  hours.sort((a, b) => a - b);

  const usersReached = hours.length;
  const totalUsers = users.length;

  return {
    totalUsers,
    usersReached,
    reachedPct: totalUsers ? Math.round((usersReached / totalUsers) * 100) : 0,
    medianHours: usersReached ? Math.round(hours[Math.floor(usersReached / 2)] * 10) / 10 : null,
    avgHours: usersReached ? Math.round((hours.reduce((s, h) => s + h, 0) / usersReached) * 10) / 10 : null,
  };
}

// ---------- Retention (shared by AARRR and HEART) ----------

export type RetentionResult = { retainedCount: number; eligibleCount: number; retainedPct: number };

/** % of users whose account is at least 30 days old who've still been
 * active (any PageView or AnalyticsEvent) in the last 30 days — a simple
 * "are they still around" snapshot, not tied to any selected date range. */
export async function getRetention(): Promise<RetentionResult> {
  const admins = await adminUserIds();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const eligible = await prisma.user.findMany({
    where: { role: "USER", createdAt: { lte: cutoff }, id: { notIn: admins } },
    select: { id: true },
  });
  if (eligible.length === 0) return { retainedCount: 0, eligibleCount: 0, retainedPct: 0 };

  const eligibleSet = new Set(eligible.map((u) => u.id));
  const recentActive = await activeUserIds({ from: cutoff, to: new Date() }, admins);
  let retainedCount = 0;
  for (const id of recentActive) if (eligibleSet.has(id)) retainedCount++;

  return {
    retainedCount,
    eligibleCount: eligible.length,
    retainedPct: Math.round((retainedCount / eligible.length) * 100),
  };
}

// ---------- AARRR (Pirate Metrics) funnel ----------

export type AarrrFunnel = {
  acquisition: { count: number; prevCount: number; change: number | null };
  activation: { activatedCount: number; signupCount: number; activatedPct: number };
  retention: RetentionResult;
  referral: { count: number; prevCount: number; change: number | null };
  revenue: { totalEGP: number; prevTotalEGP: number; change: number | null };
};

/** % of a signup cohort that reached the value moment within 7 days of
 * signing up — the classic AARRR "Activation" stage. */
async function activationForRange(range: DateRange): Promise<AarrrFunnel["activation"]> {
  const cohort = await prisma.user.findMany({
    where: { role: "USER", createdAt: { gte: range.from, lte: range.to } },
    select: { id: true, createdAt: true },
  });
  if (cohort.length === 0) return { activatedCount: 0, signupCount: 0, activatedPct: 0 };

  const firstValueAt = await firstValueMomentByUser(cohort.map((u) => u.id));
  let activatedCount = 0;
  for (const u of cohort) {
    const firstValue = firstValueAt.get(u.id);
    if (firstValue && firstValue.getTime() - u.createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000) activatedCount++;
  }
  return {
    activatedCount,
    signupCount: cohort.length,
    activatedPct: Math.round((activatedCount / cohort.length) * 100),
  };
}

/** Acquisition (signups), Activation (reached value within 7d), Retention
 * (still active 30d+ later), Referral (invite codes activated), and
 * Revenue (confirmed shop + session payments) for `range`, each compared
 * to the immediately preceding period of equal length. Retention is
 * passed in rather than recomputed, since it's a point-in-time snapshot
 * shared with the HEART scorecard, not something that varies by range. */
export async function getAarrrFunnel(range: DateRange, retention: RetentionResult): Promise<AarrrFunnel> {
  const prev = priorPeriod(range);

  const [
    signupCount,
    prevSignupCount,
    activation,
    referralCount,
    prevReferralCount,
    revenue,
    prevRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: prev.from, lte: prev.to } } }),
    activationForRange(range),
    prisma.analyticsEvent.count({ where: { object: "Referral", action: "activated", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { object: "Referral", action: "activated", createdAt: { gte: prev.from, lte: prev.to } } }),
    revenueForRange(range),
    revenueForRange(prev),
  ]);

  const totalEGP = revenue.shopEGP + revenue.sessionsEGP;
  const prevTotalEGP = prevRevenue.shopEGP + prevRevenue.sessionsEGP;

  return {
    acquisition: { count: signupCount, prevCount: prevSignupCount, change: percentChange(signupCount, prevSignupCount) },
    activation,
    retention,
    referral: { count: referralCount, prevCount: prevReferralCount, change: percentChange(referralCount, prevReferralCount) },
    revenue: { totalEGP, prevTotalEGP, change: percentChange(totalEGP, prevTotalEGP) },
  };
}

// ---------- Google HEART framework ----------

export type HeartScorecard = {
  happiness: { avgRating: number | null; responseCount: number };
  engagement: { avgEventsPerActiveUser: number; activeUsers: number };
  adoption: { pctAdoptedAtLeastOne: number };
  retention: { retainedPct: number };
  taskSuccess: { bookingConfirmRate: number | null; assessmentCompletionRate: number | null };
};

async function happinessForRange(range: DateRange): Promise<HeartScorecard["happiness"]> {
  const agg = await prisma.feedback.aggregate({
    where: { createdAt: { gte: range.from, lte: range.to } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return {
    avgRating: agg._avg.rating !== null ? Math.round(agg._avg.rating * 10) / 10 : null,
    responseCount: agg._count._all,
  };
}

async function engagementForRange(range: DateRange, admins: string[]): Promise<HeartScorecard["engagement"]> {
  const activeIds = await activeUserIds(range, admins);
  if (activeIds.size === 0) return { avgEventsPerActiveUser: 0, activeUsers: 0 };
  const eventCount = await prisma.analyticsEvent.count({
    where: { createdAt: { gte: range.from, lte: range.to }, userId: { in: [...activeIds] } },
  });
  return {
    avgEventsPerActiveUser: Math.round((eventCount / activeIds.size) * 10) / 10,
    activeUsers: activeIds.size,
  };
}

async function taskSuccessForRange(range: DateRange): Promise<HeartScorecard["taskSuccess"]> {
  const [bookingsCreated, bookingsConfirmed, assessmentsStarted, assessmentsCompleted] = await Promise.all([
    prisma.analyticsEvent.count({ where: { object: "SessionBooking", action: "created", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { object: "SessionBooking", action: "confirmed", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { object: "Assessment", action: "started", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { object: "Assessment", action: "completed", createdAt: { gte: range.from, lte: range.to } } }),
  ]);
  return {
    bookingConfirmRate: bookingsCreated ? Math.round((bookingsConfirmed / bookingsCreated) * 100) : null,
    assessmentCompletionRate: assessmentsStarted ? Math.round((assessmentsCompleted / assessmentsStarted) * 100) : null,
  };
}

/**
 * Happiness (average Feedback star rating — the only sentiment data this
 * app collects), Engagement (events per active user), Adoption (% who've
 * tried at least one core feature, ever), Retention (shared snapshot with
 * AARRR), and Task success (booking and assessment completion rates) for
 * `range`. Retention and featureAdoption are passed in rather than
 * recomputed, since both are point-in-time/all-time snapshots the page
 * already computes once for the funnel and adoption sections.
 */
export async function getHeartScorecard(
  range: DateRange,
  retention: RetentionResult,
  featureAdoption: FeatureAdoptionResult,
): Promise<HeartScorecard> {
  const admins = await adminUserIds();
  const [happiness, engagement, taskSuccess] = await Promise.all([
    happinessForRange(range),
    engagementForRange(range, admins),
    taskSuccessForRange(range),
  ]);
  const zeroFeatureBucket = featureAdoption.distribution.find((d) => d.featuresAdopted === 0);
  const pctAdoptedAtLeastOne = 100 - (zeroFeatureBucket?.pct ?? 0);

  return {
    happiness,
    engagement,
    adoption: { pctAdoptedAtLeastOne },
    retention: { retainedPct: retention.retainedPct },
    taskSuccess,
  };
}
