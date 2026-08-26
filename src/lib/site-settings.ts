import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type SiteSettingsData = {
  arabicEnabled: boolean;
  resourcesPromoPlacement: "TOP" | "BOTTOM";
  resourcesPromoHidden: boolean;
  hiddenArticleSlugs: string[];
  hideJournalTaglineButton: boolean;
  /** Hour of day (0–23, Egypt local time) the daily journal-reminder push
   * cron actually sends at — see src/lib/cron-schedule.ts. */
  journalReminderHour: number;
  /** Hour of day (0–23, Egypt local time) the session-reminder push cron
   * actually sends at. */
  sessionReminderHour: number;
};

const DEFAULTS: SiteSettingsData = {
  arabicEnabled: true,
  resourcesPromoPlacement: "TOP",
  resourcesPromoHidden: false,
  hiddenArticleSlugs: [],
  hideJournalTaglineButton: false,
  journalReminderHour: 20,
  sessionReminderHour: 19,
};

/** Memoized per-request — most pages only need this once, and several call
    getLocale() (which reads it) more than once per render. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;
  return {
    arabicEnabled: row.arabicEnabled,
    resourcesPromoPlacement: row.resourcesPromoPlacement,
    resourcesPromoHidden: row.resourcesPromoHidden,
    hiddenArticleSlugs: row.hiddenArticleSlugs,
    hideJournalTaglineButton: row.hideJournalTaglineButton,
    journalReminderHour: row.journalReminderHour,
    sessionReminderHour: row.sessionReminderHour,
  };
});

export async function updateSiteSettings(formData: FormData) {
  "use server";
  await requireAdmin();
  const arabicEnabled = formData.get("arabicEnabled") === "on";
  const resourcesPromoPlacement = formData.get("resourcesPromoPlacement") === "BOTTOM" ? "BOTTOM" : "TOP";
  const resourcesPromoHidden = formData.get("resourcesPromoHidden") === "on";
  const hiddenArticleSlugs = formData.getAll("hiddenArticleSlugs").map(String).filter(Boolean);
  const hideJournalTaglineButton = formData.get("hideJournalTaglineButton") === "on";

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      arabicEnabled,
      resourcesPromoPlacement,
      resourcesPromoHidden,
      hiddenArticleSlugs,
      hideJournalTaglineButton,
    },
    update: { arabicEnabled, resourcesPromoPlacement, resourcesPromoHidden, hiddenArticleSlugs, hideJournalTaglineButton },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/resources");
}

function parseHour(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 23) return fallback;
  return n;
}

/** Updates only the two push-notification send hours, leaving every other
 * site setting untouched — used from /admin/notifications rather than the
 * general settings form since it's specifically about the cron schedule. */
export async function updateNotificationSchedule(formData: FormData) {
  "use server";
  await requireAdmin();
  const current = await getSiteSettings();
  const journalReminderHour = parseHour(formData.get("journalReminderHour"), current.journalReminderHour);
  const sessionReminderHour = parseHour(formData.get("sessionReminderHour"), current.sessionReminderHour);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...DEFAULTS, journalReminderHour, sessionReminderHour },
    update: { journalReminderHour, sessionReminderHour },
  });

  revalidatePath("/admin/notifications");
}
