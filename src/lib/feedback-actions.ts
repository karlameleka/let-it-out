"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { sendSupportNotification } from "@/lib/email";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { trackEvent } from "@/lib/analytics-events";
import type { FeedbackService } from "@/generated/prisma/enums";

const SERVICES: FeedbackService[] = ["COUNSELING", "JOURNALS", "WORKSHOPS", "RESOURCES", "SHOP", "APP_GENERAL"];

const feedbackSchema = z.object({
  service: z.enum(SERVICES as [FeedbackService, ...FeedbackService[]]),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(3000).optional(),
});

export type FeedbackFormState = { error?: string; success?: boolean } | undefined;

const SERVICE_LABELS: Record<FeedbackService, string> = {
  COUNSELING: "Counseling",
  JOURNALS: "Guided Journals",
  WORKSHOPS: "Workshops",
  RESOURCES: "Resources",
  SHOP: "Shop",
  APP_GENERAL: "The app overall",
};

export async function submitFeedback(_prevState: FeedbackFormState, formData: FormData): Promise<FeedbackFormState> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.feedback;

  const session = await requireUser().catch(() => null);
  if (!session) return { error: t.pleaseLogIn };

  const parsed = feedbackSchema.safeParse({
    service: formData.get("service"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.ratingRequired };
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: session.userId,
      service: parsed.data.service,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  void trackEvent(session.userId, "Feedback", "submitted", { service: feedback.service, rating: feedback.rating });

  await sendSupportNotification({
    subject: `New feedback: ${SERVICE_LABELS[feedback.service]} (${feedback.rating}/5)`,
    lines: [
      { label: "From", value: `${session.name} <${session.email}>` },
      { label: "Service", value: SERVICE_LABELS[feedback.service] },
      { label: "Rating", value: `${feedback.rating}/5` },
      { label: "Comment", value: feedback.comment || "(no comment)" },
    ],
  });

  return { success: true };
}
