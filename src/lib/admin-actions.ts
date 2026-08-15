"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

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

export async function createPromoCode(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountType = String(formData.get("discountType"));
  const discountValue = Number(formData.get("discountValue"));
  const expiresAtRaw = String(formData.get("expiresAt") || "");
  const maxRedemptionsRaw = String(formData.get("maxRedemptions") || "");
  const minOrderEGPRaw = String(formData.get("minOrderEGP") || "");
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);

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
