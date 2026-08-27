import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { IntakeSection } from "@/lib/intake-form-schema";
import type { Locale } from "@/lib/i18n/locale";

export const getIntakeFormConfig = cache(async (): Promise<{ sections: IntakeSection[]; sectionsAr: IntakeSection[] }> => {
  const row = await prisma.intakeFormConfig.findUnique({ where: { id: "singleton" } });
  return {
    sections: (row?.sections as IntakeSection[] | undefined) ?? [],
    sectionsAr: (row?.sectionsAr as IntakeSection[] | undefined) ?? [],
  };
});

/** Resolves the sections to actually show/parse for a given locale, falling
 * back to English when no Arabic version has been entered yet — an intake
 * form should never render blank just because it hasn't been translated. */
export async function getIntakeSections(locale: Locale = "en"): Promise<IntakeSection[]> {
  const { sections, sectionsAr } = await getIntakeFormConfig();
  if (locale === "ar" && sectionsAr.length > 0) return sectionsAr;
  return sections;
}

/**
 * Saves both the English and Arabic sections arrays as submitted by the
 * admin editor — each client component owns building/reordering its own
 * array via drag-free add/remove controls and serializes it to a hidden
 * JSON field, since hand-writing individually-named form fields for an
 * arbitrarily nested, variable-length structure isn't practical. The
 * Arabic array is fully independent of the English one (own field names,
 * own field count/order) — nothing requires them to mirror each other,
 * since whichever array actually renders to a client is also the one used
 * to parse their submitted answers (see submitIntakeFormAction).
 */
export async function updateIntakeFormSections(formData: FormData) {
  "use server";
  await requireAdmin();
  // Parsed straight from JSON, so it's already a plain JSON-compatible
  // value — Prisma's Json input type just wants that structurally, not the
  // IntakeSection[] shape.
  const sections = JSON.parse(String(formData.get("sectionsJson") ?? "[]"));
  const sectionsAr = JSON.parse(String(formData.get("sectionsArJson") ?? "[]"));

  await prisma.intakeFormConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", sections, sectionsAr },
    update: { sections, sectionsAr },
  });

  revalidatePath("/admin/intake-form");
}
