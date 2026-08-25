"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendPushToAllSubscribers } from "@/lib/web-push";

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

  // Best-effort — a missing/broken web push config must never block the
  // event itself from being posted. Every subscribed browser (Android
  // Chrome, desktop, or an installed iOS PWA) gets this the same way.
  const dateLabel = startAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  await sendPushToAllSubscribers({
    title: "New event: " + title,
    body: description ? description.slice(0, 140) : `${dateLabel}${location ? ` · ${location}` : ""}`,
    url: "/upcoming",
  }).catch((err) => console.error("[event-actions] Failed to send event announcement push:", err));

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
