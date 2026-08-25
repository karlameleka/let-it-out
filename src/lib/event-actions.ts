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
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "").trim();

  if (!title || !date) return;

  const startAt = new Date(`${date}T${time || "00:00"}:00`);
  if (Number.isNaN(startAt.getTime())) return;

  let meetingLink: string | null = null;
  if (meetingLinkRaw) {
    try {
      new URL(meetingLinkRaw);
      meetingLink = meetingLinkRaw;
    } catch {
      // Not a valid URL — silently dropped rather than blocking the whole
      // event from being posted over one optional field.
    }
  }

  await prisma.event.create({
    data: {
      title,
      startAt,
      location: location || null,
      description: description || null,
      meetingLink,
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
