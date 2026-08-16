import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export const getSiteTextOverrides = cache(async (): Promise<Map<string, string>> => {
  const rows = await prisma.siteText.findMany();
  return new Map(rows.map((r) => [r.key, r.value]));
});

// Merges admin-entered overrides over a dictionary slice, matched by
// "<prefix>.<objectKey>" for English and "<prefix>.<objectKey>.ar" for
// Arabic — each language is stored and applied independently.
export function applyOverrides<T extends Record<string, string>>(
  base: T,
  prefix: string,
  overrides: Map<string, string>,
  locale: string
): T {
  if (overrides.size === 0) return base;
  const suffix = locale === "ar" ? ".ar" : "";
  const result = { ...base };
  for (const key of Object.keys(base)) {
    const value = overrides.get(`${prefix}.${key}${suffix}`);
    if (value) (result as Record<string, string>)[key] = value;
  }
  return result;
}

export async function updateSiteText(formData: FormData) {
  "use server";
  await requireAdmin();
  const ops = [];
  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("text.")) continue;
    const key = name.slice("text.".length);
    const value = String(raw).trim();
    ops.push(
      value
        ? prisma.siteText.upsert({ where: { key }, create: { key, value }, update: { value } })
        : prisma.siteText.deleteMany({ where: { key } })
    );
  }
  if (ops.length > 0) await prisma.$transaction(ops);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
