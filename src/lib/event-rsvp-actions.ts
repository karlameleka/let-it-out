"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { RSVPStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: RSVPStatus[] = ["ATTENDING", "MAYBE", "NOT_ATTENDING"];

export async function setEventRSVP(formData: FormData) {
  const session = await requireUser().catch(() => null);
  if (!session) return;

  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "") as RSVPStatus;
  if (!eventId || !VALID_STATUSES.includes(status)) return;

  await prisma.eventRSVP.upsert({
    where: { eventId_userId: { eventId, userId: session.userId } },
    update: { status },
    create: { eventId, userId: session.userId, status },
  });

  revalidatePath("/upcoming");
  revalidatePath("/admin/events");
  revalidatePath("/admin");
}
