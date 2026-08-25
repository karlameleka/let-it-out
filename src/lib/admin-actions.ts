"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendPasswordResetEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";
import { deleteUserAccountCompletely } from "@/lib/account-deletion";

const PORTAL_SETUP_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  await prisma.order.update({ where: { id: orderId }, data: { status: status as never } });
  revalidatePath("/admin/orders");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status"));
  await prisma.bookingRequest.update({ where: { id: bookingId }, data: { status: status as never } });
  revalidatePath("/admin/bookings");
}

export async function updateWorkshopInquiryStatus(formData: FormData) {
  await requireAdmin();
  const inquiryId = String(formData.get("inquiryId"));
  const status = String(formData.get("status"));
  await prisma.workshopInquiry.update({ where: { id: inquiryId }, data: { status: status as never } });
  revalidatePath("/admin/workshops");
}

export async function updateLeadStatus(formData: FormData) {
  await requireAdmin();
  const leadId = String(formData.get("leadId"));
  const status = String(formData.get("status"));
  await prisma.lead.update({ where: { id: leadId }, data: { status: status as never } });
  revalidatePath("/admin/crm");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId } }),
    prisma.order.delete({ where: { id: orderId } }),
  ]);
  revalidatePath("/admin/orders");
}

export async function deleteBookingRequest(formData: FormData) {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  await prisma.bookingRequest.delete({ where: { id: bookingId } });
  revalidatePath("/admin/bookings");
}

export async function deleteWorkshopInquiry(formData: FormData) {
  await requireAdmin();
  const inquiryId = String(formData.get("inquiryId"));
  await prisma.workshopInquiry.delete({ where: { id: inquiryId } });
  revalidatePath("/admin/workshops");
}

export async function deleteWorkshopSignup(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.workshopInterestSignup.delete({ where: { id } });
  revalidatePath("/admin/workshop-signups");
}

export async function deleteContactMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export async function deleteLead(formData: FormData) {
  await requireAdmin();
  const leadId = String(formData.get("leadId"));
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin/crm");
}

// The "Clients" list on a counselor's admin detail page is derived (grouped
// by email) from that counselor's booking requests + paid session bookings,
// not a single row — so "deleting a client" means clearing all of their
// booking history with this specific counselor.
export async function deleteCounselorClient(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const email = String(formData.get("email"));
  await prisma.$transaction([
    prisma.bookingRequest.deleteMany({ where: { counselorId, email } }),
    prisma.sessionBooking.deleteMany({ where: { counselorId, email } }),
  ]);
  revalidatePath("/admin/counselors/[id]", "page");
}

// Same complete-deletion behavior as a client's own "Delete my account" —
// the account and everything that only makes sense tied to it (journal
// entries, push subscriptions, live-chat transcripts) is gone outright;
// past orders and session requests are kept for our records but
// disassociated. If the client is logged in elsewhere, their session
// becomes invalid on their very next request (see getCurrentUser).
export async function deleteClientAccount(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  await deleteUserAccountCompletely(userId);
  revalidatePath("/admin/clients");
}

export async function createPromoCode(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountType = String(formData.get("discountType"));
  const discountValue = Number(formData.get("discountValue"));
  const expiresAtRaw = String(formData.get("expiresAt") || "");
  const maxRedemptionsRaw = String(formData.get("maxRedemptions") || "");
  const minOrderEGPRaw = String(formData.get("minOrderEGP") || "");
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  const counselorIds = formData.getAll("counselorIds").map(String).filter(Boolean);

  if (!code || !discountValue || discountValue <= 0) return;

  await prisma.promoCode.create({
    data: {
      code,
      discountType: discountType as never,
      discountValue,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      maxRedemptions: maxRedemptionsRaw ? Number(maxRedemptionsRaw) : null,
      minOrderEGP: minOrderEGPRaw ? Number(minOrderEGPRaw) : null,
      products: { create: productIds.map((productId) => ({ productId })) },
      counselors: { create: counselorIds.map((counselorId) => ({ counselorId })) },
    },
  });
  revalidatePath("/admin/promo-codes");
}

export async function togglePromoCodeActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.promoCode.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/promo-codes");
}

export async function deletePromoCode(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo-codes");
}

export async function updateVariantStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId"));
  const raw = String(formData.get("stockCount") ?? "").trim();
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stockCount: raw === "" ? null : Math.max(0, Number(raw)) },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateProductPlacement(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const active = formData.get("active") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  await prisma.product.update({ where: { id: productId }, data: { active, sortOrder } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateCounselorPlacement(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const active = formData.get("active") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const emailRaw = String(formData.get("email") ?? "").trim();
  await prisma.counselor.update({
    where: { id: counselorId },
    data: { active, sortOrder, email: emailRaw || null },
  });
  revalidatePath("/admin/counselors");
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
  revalidatePath("/");
}

export async function updateCounselorDetails(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const priceRaw = String(formData.get("priceEGP") ?? "").trim();
  const availabilityStatus = String(formData.get("availabilityStatus") ?? "AVAILABLE");
  await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      priceEGP: priceRaw === "" ? null : Math.max(0, Number(priceRaw)),
      availabilityStatus: availabilityStatus as never,
    },
  });
  revalidatePath("/admin/counselors");
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
  revalidatePath("/counseling/[slug]", "page");
  revalidatePath("/");
}

export async function updateCounselorProfileFromAdmin(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const name = String(formData.get("name") ?? "").trim();
  const credentials = String(formData.get("credentials") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const bookingUrlRaw = String(formData.get("bookingUrl") ?? "").trim();
  const photoUrlRaw = String(formData.get("photoUrl") ?? "").trim();

  if (!name || !credentials || !bio) return;

  await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      name,
      credentials,
      bio,
      specialties,
      languages,
      bookingUrl: bookingUrlRaw || null,
      ...(photoUrlRaw ? { photoUrl: photoUrlRaw } : {}),
    },
  });
  revalidatePath("/admin/counselors");
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
  revalidatePath("/counseling/[slug]", "page");
  revalidatePath("/");
}

// Sends a "set up your portal password" link — the same reset-token
// mechanism as an ordinary forgot-password flow, so no plaintext password
// ever passes through the admin's hands. Requires a notification email to
// already be on file for the counselor.
export async function sendTherapistPortalSetupLink(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const counselor = await prisma.counselor.findUnique({ where: { id: counselorId } });
  if (!counselor || !counselor.email) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.counselor.update({
    where: { id: counselor.id },
    data: {
      resetTokenHash,
      resetTokenExpiresAt: new Date(Date.now() + PORTAL_SETUP_TOKEN_TTL_MS),
      lastPasswordResetRequestAt: new Date(),
    },
  });

  const baseUrl = await getBaseUrl();
  const resetUrl = `${baseUrl}/therapist/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({ to: counselor.email, name: counselor.name, resetUrl });

  revalidatePath("/admin/counselors/[id]", "page");
}

export async function revokeTherapistPortalAccess(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      passwordHash: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  revalidatePath("/admin/counselors/[id]", "page");
}
