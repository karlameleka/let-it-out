"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";
import { screenSubmission } from "@/lib/anti-spam";

function buildWorkshopInquirySchema(v: Dictionary["validation"], w: Dictionary["workshopForm"]) {
  return z.object({
    organizationName: z.string().trim().min(1, w.orgNameRequired).max(200),
    contactName: z.string().trim().min(1, v.nameRequired).max(200),
    email: z.string().trim().email(v.emailInvalid).max(320),
    phone: z.string().trim().min(5, v.phoneInvalid).max(30),
    workshopTopic: z.string().trim().min(1, w.topicRequired).max(200),
    groupSize: z.string().trim().max(50).optional(),
    preferredDates: z.string().trim().max(300).optional(),
    message: z.string().trim().max(5000).optional(),
  });
}

export type WorkshopFormState = { error?: string; success?: boolean } | undefined;

export async function submitWorkshopInquiry(
  _prevState: WorkshopFormState,
  formData: FormData,
): Promise<WorkshopFormState> {
  const blocked = await screenSubmission(formData, "workshop-inquiry");
  if (blocked) return blocked;

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
    locale,
    subject: locale === "ar" ? "استلمنا طلب الورشة" : "We've received your workshop request",
    intro:
      locale === "ar"
        ? `شكرًا لاهتمامك بورشة "${inquiry.workshopTopic}" لـ ${inquiry.organizationName}. فريقنا هيتواصل معاك قريب لتصميم الجلسة مع بعض.`
        : `Thank you for your interest in a "${inquiry.workshopTopic}" workshop for ${inquiry.organizationName}. Our team will follow up with you shortly to design a session together.`,
  });

  return { success: true };
}
