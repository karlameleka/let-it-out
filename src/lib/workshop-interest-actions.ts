"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
});

export type WorkshopInterestFormState = { error?: string; success?: boolean } | undefined;

export async function submitWorkshopInterest(
  _prevState: WorkshopInterestFormState,
  formData: FormData,
): Promise<WorkshopInterestFormState> {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const signup = await prisma.workshopInterestSignup.create({ data: parsed.data });

  await sendSupportNotification({
    subject: "New workshop notification signup",
    lines: [{ label: "Email", value: signup.email }],
  });

  await sendCustomerConfirmation({
    to: signup.email,
    name: "there",
    subject: "You're on the list!",
    intro: "You're on the list — we'll email you the moment we announce our next training or workshop.",
  });

  return { success: true };
}
