"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  subject: z.string().trim().min(1, "Please enter a subject."),
  message: z.string().trim().min(5, "Please enter a message."),
});

export type ContactFormState = { error?: string; success?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const contact = await prisma.contactMessage.create({ data: parsed.data });

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
    subject: "We've received your message",
    intro: `Thank you for reaching out about "${contact.subject}". We'll get back to you soon.`,
  });

  return { success: true };
}
