"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { restoreTrashedItem } from "@/lib/trash";

export type RestoreFormState = { error?: string; success?: boolean } | undefined;

// Every page a restored row could land back on — cheap to over-list here
// since a restore is rare and revalidatePath on a path nobody's viewing is
// a no-op.
const REVALIDATE_PATHS = [
  "/admin/recently-deleted",
  "/admin/orders",
  "/admin/bookings",
  "/admin/crm",
  "/admin/messages",
  "/admin/products",
  "/admin/counselors",
  "/admin/promo-codes",
  "/admin/counseling-filters",
  "/admin/workshops",
  "/admin/workshop-signups",
  "/admin/articles",
  "/admin/events",
  "/admin/support",
  "/admin/finance",
  "/admin",
];

export async function restoreTrashedItemAction(
  _prevState: RestoreFormState,
  formData: FormData,
): Promise<RestoreFormState> {
  const admin = await requireAdmin();
  const trashId = String(formData.get("trashId"));
  const result = await restoreTrashedItem(trashId, admin);
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
  if (!result.success) return { error: result.error };
  return { success: true };
}
