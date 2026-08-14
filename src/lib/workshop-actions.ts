"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";

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

  const groupSizeNumber = inquiry.groupSize ? parseInt(inquiry.groupSize, 10) : NaN;
  await syncLeadToAirtable({
    Name: inquiry.contactName,
    Type: "Workshop Lead",
    Status: "New",
    Email: inquiry.email,
    Phone: inquiry.phone,
    Source: "Website",
    ...(Number.isFinite(groupSizeNumber) ? { "Group Size": groupSizeNumber } : {}),
    Notes: [
      `Organization: ${inquiry.organizationName}`,
      `Topic: ${inquiry.workshopTopic}`,
      inquiry.groupSize ? `Group size: ${inquiry.groupSize}` : null,
      inquiry.preferredDates ? `Preferred dates: ${inquiry.preferredDates}` : null,
      inquiry.message ? `Message: ${inquiry.message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

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

  await sendCustomerConfirmation({
    to: inquiry.email,
    name: inquiry.contactName,
    subject: "We've received your workshop request",
    intro: `Thank you for your interest in a "${inquiry.workshopTopic}" workshop for ${inquiry.organizationName}. Our team will follow up with you shortly to design a session together.`,
  });

  return { success: true };
}
