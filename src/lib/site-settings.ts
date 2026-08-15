import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type SiteSettingsData = {
  arabicEnabled: boolean;
  cbtExercisePlacement: "TOP" | "BOTTOM";
};

const DEFAULTS: SiteSettingsData = { arabicEnabled: true, cbtExercisePlacement: "TOP" };

/** Memoized per-request — most pages only need this once, and several call
    getLocale() (which reads it) more than once per render. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;
  return { arabicEnabled: row.arabicEnabled, cbtExercisePlacement: row.cbtExercisePlacement };
});

export async function updateSiteSettings(formData: FormData) {
  "use server";
  await requireAdmin();
  const arabicEnabled = formData.get("arabicEnabled") === "on";
  const cbtExercisePlacement = formData.get("cbtExercisePlacement") === "BOTTOM" ? "BOTTOM" : "TOP";

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", arabicEnabled, cbtExercisePlacement },
    update: { arabicEnabled, cbtExercisePlacement },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
