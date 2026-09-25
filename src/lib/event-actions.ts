"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendPushToAllSubscribers } from "@/lib/web-push";
import { captureRow, trashedItemCreateArgs } from "@/lib/trash";
import { CAIRO_TIME_ZONE, zonedTimeToUtc } from "@/lib/timezone";

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const descriptionAr = String(formData.get("descriptionAr") ?? "").trim();
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "").trim();

  if (!title || !date) return;

  // The admin-entered date/time is Cairo-local wall-clock (the event's real
  // location) — zonedTimeToUtc converts it to the correct absolute instant,
  // rather than the server's own local clock (UTC on Vercel) silently
  // reinterpreting it as UTC, which used to store every event 2-3 hours
  // later than the admin actually meant.
  const startAt = zonedTimeToUtc(date, time || "00:00", CAIRO_TIME_ZONE);
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
      titleAr: titleAr || null,
      startAt,
      location: location || null,
      description: description || null,
      descriptionAr: descriptionAr || null,
      meetingLink,
    },
  });

  // Best-effort — a missing/broken web push config must never block the
  // event itself from being posted. Every subscribed browser (Android
  // Chrome, desktop, or an installed iOS PWA) gets this the same way, in
  // whichever language it's subscribed under.
  const dateLabel = startAt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: CAIRO_TIME_ZONE,
  });
  const dateLabelAr = startAt.toLocaleDateString("ar-EG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: CAIRO_TIME_ZONE,
  });
  // The OS/browser already shows the app as the notification's source, so
  // the event's own headline is the title instead of repeating the brand
  // name — the specific details go in the body.
  await sendPushToAllSubscribers({
    en: {
      title: `New event: ${title}`,
      body: description ? description.slice(0, 120) : `${dateLabel}${location ? ` · ${location}` : ""}`,
      url: "/upcoming",
    },
    ar: {
      title: `فعالية جديدة: ${titleAr || title}`,
      body: descriptionAr
        ? descriptionAr.slice(0, 120)
        : description
          ? description.slice(0, 120)
          : `${dateLabelAr}${location ? ` · ${location}` : ""}`,
      url: "/upcoming",
    },
  }).catch((err) => console.error("[event-actions] Failed to send event announcement push:", err));

  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
}

export async function deleteEvent(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  if (!existing) return;
  const snapshot = await captureRow("Event", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "Event",
        originalId: id,
        summary: `Event "${existing.title}"`,
        data: snapshot,
        actor: admin,
      }),
    }),
    // EventRSVP cascades at the DB level — already captured as a child above.
    prisma.event.delete({ where: { id } }),
  ]).catch(() => null);

  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
}
