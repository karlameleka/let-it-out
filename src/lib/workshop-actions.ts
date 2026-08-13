"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification } from "@/lib/email";

const workshopInquirySchema = z.object({
  organizationName: z.string().trim().min(1, "Please enter your organization or community name."),
  contactName: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(5, "Please enter a valid phone number."),
  workshopTopic: z.string().trim().min(1, "Please choose a topic."),
  groupSize: z.string().trim().optional(),
  preferredDates: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export type WorkshopFormState = { error?: string; success?: boolean } | undefined;

export async function submitWorkshopInquiry(
  _prevState: WorkshopFormState,
  formData: FormData,
): Promise<WorkshopFormState> {
  const parsed = workshopInquirySchema.safeParse({
    organizationName: formData.get("organizationName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    workshopTopic: formData.get("workshopTopic"),
    groupSize: formData.get("groupSize") || undefined,
    preferredDates: formData.get("preferredDates") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const inquiry = await prisma.workshopInquiry.create({ data: parsed.data });

  await sendSupportNotification({
    subject: "New workshop inquiry",
    lines: [
      { label: "Organization", value: inquiry.organizationName },
      { label: "Contact name", value: inquiry.contactName },
      { label: "Email", value: inquiry.email },
      { label: "Phone", value: inquiry.phone },
      { label: "Topic", value: inquiry.workshopTopic },
      { label: "Group size", value: inquiry.groupSize || "—" },
      { label: "Preferred dates", value: inquiry.preferredDates || "—" },
      { label: "Message", value: inquiry.message || "—" },
    ],
  });

  return { success: true };
}
