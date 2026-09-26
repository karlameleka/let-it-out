import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-log";

export type SiteSettingsData = {
  arabicEnabled: boolean;
  hiddenArticleSlugs: string[];
  hideJournalTaglineButton: boolean;
  therapistAgreementFileData: string | null;
  therapistAgreementFileName: string | null;
};

const DEFAULTS: SiteSettingsData = {
  arabicEnabled: true,
  hiddenArticleSlugs: [],
  hideJournalTaglineButton: false,
  therapistAgreementFileData: null,
  therapistAgreementFileName: null,
};

/** Memoized per-request — most pages only need this once, and several call
    getLocale() (which reads it) more than once per render. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;
  return {
    arabicEnabled: row.arabicEnabled,
    hiddenArticleSlugs: row.hiddenArticleSlugs,
    hideJournalTaglineButton: row.hideJournalTaglineButton,
    therapistAgreementFileData: row.therapistAgreementFileData,
    therapistAgreementFileName: row.therapistAgreementFileName,
  };
});

export async function updateSiteSettings(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const arabicEnabled = formData.get("arabicEnabled") === "on";
  const hideJournalTaglineButton = formData.get("hideJournalTaglineButton") === "on";

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", arabicEnabled, hideJournalTaglineButton },
    update: { arabicEnabled, hideJournalTaglineButton },
  });
  await logAudit({
    actor: admin,
    action: "site_settings.updated",
    summary: "Updated site settings",
    metadata: { arabicEnabled, hideJournalTaglineButton },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

/** Separate from updateSiteSettings deliberately: this is submitted from a
 * different form on /admin/resources, which doesn't carry
 * arabicEnabled/hideJournalTaglineButton fields — using the same action
 * for both would silently reset those to unchecked every time this form
 * saves, since Prisma's `update` only preserves fields *not* passed. Using
 * a dedicated action with its own narrow `update: { hiddenArticleSlugs }`
 * touches only this one column. */
export async function updateHiddenArticles(formData: FormData) {
  "use server";
  await requireAdmin();
  const hiddenArticleSlugs = formData.getAll("hiddenArticleSlugs").map(String).filter(Boolean);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", hiddenArticleSlugs },
    update: { hiddenArticleSlugs },
  });

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}
