import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ResourceBlockKind } from "@/generated/prisma/enums";

export type { ResourceBlockKind };

export const RESOURCE_BLOCK_ORDER_DEFAULT: ResourceBlockKind[] = [
  "JOURNAL_PROMO",
  "CBT_PROMO",
  "BREATHING_PROMO",
  "ASSESSMENTS_PROMO",
  "ARTICLES",
];

export const RESOURCE_BLOCK_LABELS: Record<ResourceBlockKind, string> = {
  JOURNAL_PROMO: "Journal promo card",
  CBT_PROMO: "CBT toolkit promo card",
  BREATHING_PROMO: "Breathing exercise promo card",
  ASSESSMENTS_PROMO: "My Assessments promo card",
  ARTICLES: "Article list",
};

/** Every /resources section, ordered — falls back to the default 5 rows
 * (all visible, default order) for any kind missing from the DB, so a
 * fresh install or a row that somehow got deleted never hides a section
 * outright. */
export const getResourceBlocks = cache(async (): Promise<{ kind: ResourceBlockKind; hidden: boolean; sortOrder: number }[]> => {
  const rows = await prisma.resourceBlock.findMany();
  const byKind = new Map(rows.map((r) => [r.kind, r]));
  return RESOURCE_BLOCK_ORDER_DEFAULT.map((kind, i) => {
    const row = byKind.get(kind);
    return { kind, hidden: row?.hidden ?? false, sortOrder: row?.sortOrder ?? i };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
});

export async function toggleResourceBlockHidden(formData: FormData) {
  "use server";
  await requireAdmin();
  const kind = String(formData.get("kind")) as ResourceBlockKind;
  const hidden = formData.get("hidden") === "on";
  await prisma.resourceBlock.upsert({
    where: { kind },
    create: { kind, hidden },
    update: { hidden },
  });
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

/** Swaps this block's sortOrder with its neighbor in the given direction —
 * simple enough for a fixed 5-row list, no need for drag-and-drop or
 * fractional ordering. */
async function moveResourceBlock(kind: ResourceBlockKind, direction: "up" | "down") {
  await requireAdmin();
  const ordered = await getResourceBlocks();
  const index = ordered.findIndex((b) => b.kind === kind);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighborIndex < 0 || neighborIndex >= ordered.length) return;

  const current = ordered[index];
  const neighbor = ordered[neighborIndex];

  await prisma.$transaction([
    prisma.resourceBlock.upsert({
      where: { kind: current.kind },
      create: { kind: current.kind, sortOrder: neighbor.sortOrder, hidden: current.hidden },
      update: { sortOrder: neighbor.sortOrder },
    }),
    prisma.resourceBlock.upsert({
      where: { kind: neighbor.kind },
      create: { kind: neighbor.kind, sortOrder: current.sortOrder, hidden: neighbor.hidden },
      update: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function moveResourceBlockUp(formData: FormData) {
  "use server";
  await moveResourceBlock(String(formData.get("kind")) as ResourceBlockKind, "up");
}

export async function moveResourceBlockDown(formData: FormData) {
  "use server";
  await moveResourceBlock(String(formData.get("kind")) as ResourceBlockKind, "down");
}
