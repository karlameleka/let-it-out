"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";

function buildSchema(v: Dictionary["validation"]) {
  return z.object({
    email: z.string().trim().email(v.emailInvalid),
  });
}

export type WorkshopInterestFormState = { error?: string; success?: boolean } | undefined;

export async function submitWorkshopInterest(
  _prevState: WorkshopInterestFormState,
  formData: FormData,
): Promise<WorkshopInterestFormState> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = buildSchema(dict.validation).safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? dict.validation.invalidInput };
  }

  const signup = await prisma.workshopInterestSignup.create({ data: parsed.data });

  await createLead({
    name: signup.email,
    type: "WORKSHOP_LEAD",
    email: signup.email,
    source: "Website",
    notes: "Signed up via workshop notifications popup.",
  });

  await syncLeadToAirtable({
    Name: signup.email,
    Type: "Workshop Lead",
    Status: "New",
    Email: signup.email,
    Source: "Website",
    Notes: "Signed up via workshop notifications popup.",
  });

  await sendSupportNotification({
    subject: "New workshop notification signup",
    lines: [{ label: "Email", value: signup.email }],
  });

  await sendCustomerConfirmation({
    to: signup.email,
    name: locale === "ar" ? "صديقنا" : "there",
    locale,
    subject: locale === "ar" ? "أنت على القائمة!" : "You're on the list!",
    intro:
      locale === "ar"
        ? "أنت على القائمة — هنبعتلك إيميل أول ما نعلن عن ورشة أو تدريب جديد."
        : "You're on the list — we'll email you the moment we announce our next training or workshop.",
  });

  return { success: true };
}
