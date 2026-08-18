import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { IntakeSection } from "@/lib/intake-form-schema";

export const getIntakeSections = cache(async (): Promise<IntakeSection[]> => {
  const row = await prisma.intakeFormConfig.findUnique({ where: { id: "singleton" } });
  return (row?.sections as IntakeSection[] | undefined) ?? [];
});

/**
 * Saves the full sections array as submitted by the admin editor — the
 * client component owns building/reordering the array via drag-free
 * add/remove controls and serializes it to one hidden JSON field, since
 * hand-writing individually-named form fields for an arbitrarily nested,
 * variable-length structure isn't practical.
 */
export async function updateIntakeFormSections(formData: FormData) {
  "use server";
  await requireAdmin();
  // Parsed straight from JSON, so it's already a plain JSON-compatible
  // value — Prisma's Json input type just wants that structurally, not the
  // IntakeSection[] shape.
  const sections = JSON.parse(String(formData.get("sectionsJson") ?? "[]"));

  await prisma.intakeFormConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", sections },
    update: { sections },
  });

  revalidatePath("/admin/intake-form");
}
