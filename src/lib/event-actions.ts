"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !date) return;

  const startAt = new Date(`${date}T${time || "00:00"}:00`);
  if (Number.isNaN(startAt.getTime())) return;

  await prisma.event.create({
    data: {
      title,
      startAt,
      location: location || null,
      description: description || null,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.event.delete({ where: { id } }).catch(() => null);

  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
}
