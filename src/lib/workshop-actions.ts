"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";

function buildWorkshopInquirySchema(v: Dictionary["validation"], w: Dictionary["workshopForm"]) {
  return z.object({
    organizationName: z.string().trim().min(1, w.orgNameRequired),
    contactName: z.string().trim().min(1, v.nameRequired),
    email: z.string().trim().email(v.emailInvalid),
    phone: z.string().trim().min(5, v.phoneInvalid),
    workshopTopic: z.string().trim().min(1, w.topicRequired),
    groupSize: z.string().trim().optional(),
    preferredDates: z.string().trim().optional(),
    message: z.string().trim().optional(),
  });
}

export type WorkshopFormState = { error?: string; success?: boolean } | undefined;

export async function submitWorkshopInquiry(
  _prevState: WorkshopFormState,
  formData: FormData,
): Promise<WorkshopFormState> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = buildWorkshopInquirySchema(dict.validation, dict.workshopForm).safeParse({
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
    return { error: parsed.error.issues[0]?.message ?? dict.validation.invalidInput };
  }

  const inquiry = await prisma.workshopInquiry.create({ data: parsed.data });

  const groupSizeNumber = inquiry.groupSize ? parseInt(inquiry.groupSize, 10) : NaN;
  const leadNotes = [
    `Organization: ${inquiry.organizationName}`,
    `Topic: ${inquiry.workshopTopic}`,
    inquiry.groupSize ? `Group size: ${inquiry.groupSize}` : null,
    inquiry.preferredDates ? `Preferred dates: ${inquiry.preferredDates}` : null,
    inquiry.message ? `Message: ${inquiry.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await createLead({
    name: inquiry.contactName,
    type: "WORKSHOP_LEAD",
    email: inquiry.email,
    phone: inquiry.phone,
    source: "Website",
    ...(Number.isFinite(groupSizeNumber) ? { groupSize: groupSizeNumber } : {}),
    notes: leadNotes,
  });

  await syncLeadToAirtable({
    Name: inquiry.contactName,
    Type: "Workshop Lead",
    Status: "New",
    Email: inquiry.email,
    Phone: inquiry.phone,
    Source: "Website",
    ...(Number.isFinite(groupSizeNumber) ? { "Group Size": groupSizeNumber } : {}),
    Notes: leadNotes,
  });

  await sendSupportNotification({
    subject: "New workshop inquiry",
    lines: [
      { label: "Organization", value: inquiry.organizationName },
      { label: "Contact name", value: inquiry.contactName },
      { label: "Email", value: inquiry.email },
      { label: "Phone", value: inquiry.phone },
      { label: "Topic", value: inquiry.workshopTopic },
      { label: "Group size", value: inquiry.groupSize || "Not provided" },
      { label: "Preferred dates", value: inquiry.preferredDates || "Not provided" },
      { label: "Message", value: inquiry.message || "Not provided" },
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
