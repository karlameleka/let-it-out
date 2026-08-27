"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";

function buildContactSchema(v: Dictionary["validation"], c: Dictionary["contact"]) {
  return z.object({
    name: z.string().trim().min(1, v.nameRequired),
    email: z.string().trim().email(v.emailInvalid),
    subject: z.string().trim().min(1, c.subjectRequired),
    message: z.string().trim().min(5, c.messageRequired),
  });
}

export type ContactFormState = { error?: string; success?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = buildContactSchema(dict.validation, dict.contact).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? dict.validation.invalidInput };
  }

  const contact = await prisma.contactMessage.create({ data: parsed.data });

  const contactNotes = `${contact.subject}\n\n${contact.message}`;

  await createLead({
    name: contact.name,
    type: "GENERAL_INQUIRY",
    email: contact.email,
    source: "Website",
    notes: contactNotes,
  });

  await syncLeadToAirtable({
    Name: contact.name,
    Type: "General Inquiry",
    Status: "New",
    Email: contact.email,
    Source: "Website",
    Notes: contactNotes,
  });

  await sendSupportNotification({
    subject: "New contact message",
    lines: [
      { label: "Name", value: contact.name },
      { label: "Email", value: contact.email },
      { label: "Subject", value: contact.subject },
      { label: "Message", value: contact.message },
    ],
  });

  await sendCustomerConfirmation({
    to: contact.email,
    name: contact.name,
    locale,
    subject: locale === "ar" ? "استلمنا رسالتك" : "We've received your message",
    intro:
      locale === "ar"
        ? `شكرًا لتواصلك بخصوص "${contact.subject}". هنرد عليك قريب.`
        : `Thank you for reaching out about "${contact.subject}". We'll get back to you soon.`,
  });

  return { success: true };
}
