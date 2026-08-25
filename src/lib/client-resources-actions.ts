"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

/** Lets a client mark one of their own assignments done/not done. Scoped
 * to both this item's clientEmail matching the logged-in session AND
 * kind: "ASSIGNMENT" — a client can never toggle someone else's item, and
 * this can never accidentally touch a link/PDF/note row. */
export async function toggleAssignmentComplete(formData: FormData) {
  const user = await requireUser().catch(() => null);
  if (!user) return;

  const itemId = String(formData.get("itemId") ?? "");
  const item = await prisma.assignedResource.findFirst({
    where: { id: itemId, clientEmail: user.email, kind: "ASSIGNMENT" },
    select: { completedAt: true },
  });
  if (!item) return;

  await prisma.assignedResource.updateMany({
    where: { id: itemId, clientEmail: user.email, kind: "ASSIGNMENT" },
    data: { completedAt: item.completedAt ? null : new Date() },
  });

  revalidatePath("/resources");
}
