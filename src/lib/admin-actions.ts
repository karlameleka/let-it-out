"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPasswordResetEmail, sendTherapistLoginLinkEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";
import { deleteUserAccountCompletely } from "@/lib/account-deletion";
import { sendPushToAllSubscribers } from "@/lib/web-push";
import { logAudit } from "@/lib/audit-log";
import { OrderStatus } from "@/generated/prisma/enums";
import { captureRow, serializeRow, trashedItemCreateArgs } from "@/lib/trash";

const PORTAL_SETUP_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const LOGIN_LINK_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function updateOrderStatus(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  const before = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  await prisma.order.update({ where: { id: orderId }, data: { status: status as never } });
  await logAudit({
    actor: admin,
    action: "order.status_changed",
    summary: `Order #${orderId.slice(-8).toUpperCase()} status changed to ${status}`,
    targetType: "Order",
    targetId: orderId,
    metadata: { from: before?.status, to: status },
  });
  revalidatePath("/admin/orders");
}

export async function updateBookingStatus(formData: FormData) {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status"));
  const before = await prisma.bookingRequest.findUnique({ where: { id: bookingId }, select: { status: true } });
  await prisma.bookingRequest.update({ where: { id: bookingId }, data: { status: status as never } });
  await logAudit({
    actor: admin,
    action: "booking_request.status_changed",
    summary: `Booking request status changed to ${status}`,
    targetType: "BookingRequest",
    targetId: bookingId,
    metadata: { from: before?.status, to: status },
  });
  revalidatePath("/admin/bookings");
}

function parseOptionalMeetingLink(raw: string): { ok: true; value: string | null } | { ok: false } {
  if (!raw) return { ok: true, value: null };
  try {
    new URL(raw);
    return { ok: true, value: raw };
  } catch {
    return { ok: false };
  }
}

/** One-click shortcut for the common case of a paid SessionBooking that
 * was actually paid outside the automatic Paymob flow (e.g. a manual bank
 * transfer or cash arrangement confirmed by phone) — sets it straight to
 * CONFIRMED without opening the full edit form. Same effect as picking
 * "CONFIRMED" from that form's status dropdown and saving. */
export async function markSessionBookingPaid(formData: FormData) {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  await prisma.sessionBooking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
  await logAudit({
    actor: admin,
    action: "session_booking.marked_paid",
    summary: "Session booking marked paid and confirmed",
    targetType: "SessionBooking",
    targetId: bookingId,
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/upcoming");
}

export type SessionBookingEditFormState = { error?: string; success?: boolean } | undefined;

/** Full edit for a paid SessionBooking — everything but the amount actually
 * charged (priceEGP/discountEGP/paymentRef stay untouched here, since
 * editing them wouldn't change what Paymob actually processed). */
export async function updateSessionBooking(
  _prevState: SessionBookingEditFormState,
  formData: FormData,
): Promise<SessionBookingEditFormState> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const counselorId = String(formData.get("counselorId") ?? "").trim();
  const preferredDate = String(formData.get("preferredDate") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "").trim();

  if (!bookingId) return { error: "Missing booking." };
  if (!name || !email || !phone || !counselorId || !preferredDate) {
    return { error: "Please fill in name, email, phone, counselor, and date." };
  }

  const meetingLink = parseOptionalMeetingLink(meetingLinkRaw);
  if (!meetingLink.ok) return { error: "That meeting link doesn't look valid, include https://" };

  await prisma.sessionBooking.update({
    where: { id: bookingId },
    data: {
      name,
      email,
      phone,
      counselorId,
      preferredDate,
      preferredTime: preferredTime || null,
      status: status as never,
      meetingLink: meetingLink.value,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/upcoming");
  return { success: true };
}

export type BookingRequestEditFormState = { error?: string; success?: boolean } | undefined;

/** Full edit for a manual BookingRequest — replaces the old status-only
 * quick form with every editable field. */
export async function updateBookingRequestFull(
  _prevState: BookingRequestEditFormState,
  formData: FormData,
): Promise<BookingRequestEditFormState> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const counselorId = String(formData.get("counselorId") ?? "").trim();
  const preferredDate = String(formData.get("preferredDate") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  const sessionType = String(formData.get("sessionType") ?? "");
  const status = String(formData.get("status") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const meetingLinkRaw = String(formData.get("meetingLink") ?? "").trim();

  if (!bookingId) return { error: "Missing booking." };
  if (!name || !email || !phone || !counselorId || !preferredDate || !preferredTime) {
    return { error: "Please fill in name, email, phone, counselor, date, and time." };
  }

  const meetingLink = parseOptionalMeetingLink(meetingLinkRaw);
  if (!meetingLink.ok) return { error: "That meeting link doesn't look valid, include https://" };

  await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: {
      name,
      email,
      phone,
      counselorId,
      preferredDate,
      preferredTime,
      sessionType: sessionType as never,
      status: status as never,
      message: message || null,
      meetingLink: meetingLink.value,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/upcoming");
  return { success: true };
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
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const summary = `Order #${orderId.slice(-8).toUpperCase()}`;
  const snapshot = await captureRow("Order", orderId);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({ modelName: "Order", originalId: orderId, summary, data: snapshot, actor: admin }),
    }),
    prisma.orderItem.deleteMany({ where: { orderId } }),
    prisma.order.delete({ where: { id: orderId } }),
  ]);
  await logAudit({
    actor: admin,
    action: "order.deleted",
    summary: `Deleted ${summary}`,
    targetType: "Order",
    targetId: orderId,
    severity: "WARNING",
  });
  revalidatePath("/admin/orders");
}

export async function deleteBookingRequest(formData: FormData) {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  const existing = await prisma.bookingRequest.findUnique({ where: { id: bookingId }, select: { name: true } });
  if (!existing) return;
  const summary = `Booking request from ${existing.name}`;
  const snapshot = await captureRow("BookingRequest", bookingId);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({ modelName: "BookingRequest", originalId: bookingId, summary, data: snapshot, actor: admin }),
    }),
    prisma.bookingRequest.delete({ where: { id: bookingId } }),
  ]);
  await logAudit({
    actor: admin,
    action: "booking_request.deleted",
    summary: `Deleted ${summary}`,
    targetType: "BookingRequest",
    targetId: bookingId,
    severity: "WARNING",
  });
  revalidatePath("/admin/bookings");
}

// SessionBooking has no FK pointing at it (ReflectionPrompt.sourceId is a
// plain string, kept for traceability only — see its model comment), so
// this is a safe, direct delete with nothing else to clean up first,
// unlike deleteOrder/deleteProduct/deleteCounselor above which have real
// child rows or history checks to consider. Deletes a *paid* session, so
// this is audited at WARNING like every other admin delete of a real
// financial record.
export async function deleteSessionBooking(formData: FormData) {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId"));
  const existing = await prisma.sessionBooking.findUnique({
    where: { id: bookingId },
    select: { name: true, priceEGP: true, discountEGP: true, status: true },
  });
  if (!existing) return;
  const summary = `Session booking for ${existing.name} (${existing.priceEGP - existing.discountEGP} EGP, ${existing.status})`;
  const snapshot = await captureRow("SessionBooking", bookingId);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({ modelName: "SessionBooking", originalId: bookingId, summary, data: snapshot, actor: admin }),
    }),
    prisma.sessionBooking.delete({ where: { id: bookingId } }),
  ]);
  await logAudit({
    actor: admin,
    action: "session_booking.deleted",
    summary: `Deleted ${summary}`,
    targetType: "SessionBooking",
    targetId: bookingId,
    severity: "WARNING",
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/upcoming");
}

export async function deleteWorkshopInquiry(formData: FormData) {
  const admin = await requireAdmin();
  const inquiryId = String(formData.get("inquiryId"));
  const existing = await prisma.workshopInquiry.findUnique({ where: { id: inquiryId }, select: { organizationName: true } });
  if (!existing) return;
  const snapshot = await captureRow("WorkshopInquiry", inquiryId);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "WorkshopInquiry",
        originalId: inquiryId,
        summary: `Workshop inquiry from ${existing.organizationName}`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.workshopInquiry.delete({ where: { id: inquiryId } }),
  ]);
  revalidatePath("/admin/workshops");
}

export async function deleteWorkshopSignup(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.workshopInterestSignup.findUnique({ where: { id }, select: { email: true } });
  if (!existing) return;
  const snapshot = await captureRow("WorkshopInterestSignup", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "WorkshopInterestSignup",
        originalId: id,
        summary: `Workshop notify signup: ${existing.email}`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.workshopInterestSignup.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/workshop-signups");
}

export async function deleteContactMessage(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { name: true, email: true } });
  if (!existing) return;
  const snapshot = await captureRow("ContactMessage", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "ContactMessage",
        originalId: id,
        summary: `Contact message from ${existing.name} <${existing.email}>`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.contactMessage.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/messages");
}

/** Fast, blunt "a spam bot just hit us again" cleanup from the dashboard —
 * deletes every contact message from the last N hours (see RECENT_WINDOWS
 * in the admin page), regardless of whether it's spam. For anything needing
 * a precise time window or a look at the data first,
 * scripts/cleanup-lead-spam.mjs is the safer tool. */
export async function deleteRecentContactMessages(formData: FormData) {
  const admin = await requireAdmin();
  const hours = Number(formData.get("hours")) || 48;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const rows = await prisma.contactMessage.findMany({ where: { createdAt: { gte: cutoff } } });

  await prisma.$transaction([
    ...rows.map((r) =>
      prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "ContactMessage",
          originalId: r.id,
          summary: `Contact message from ${r.name} <${r.email}>`,
          data: serializeRow(r),
          actor: admin,
        }),
      }),
    ),
    prisma.contactMessage.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } }),
  ]);
  await logAudit({
    actor: admin,
    action: "contact_messages.bulk_deleted",
    summary: `Deleted ${rows.length} contact message${rows.length === 1 ? "" : "s"} from the last ${hours}h (spam cleanup)`,
    metadata: { count: rows.length, hours },
    severity: "WARNING",
  });
  revalidatePath("/admin/messages");
}

export async function deleteLead(formData: FormData) {
  const admin = await requireAdmin();
  const leadId = String(formData.get("leadId"));
  const existing = await prisma.lead.findUnique({ where: { id: leadId }, select: { name: true } });
  if (!existing) return;
  const snapshot = await captureRow("Lead", leadId);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({ modelName: "Lead", originalId: leadId, summary: `Lead: ${existing.name}`, data: snapshot, actor: admin }),
    }),
    prisma.lead.delete({ where: { id: leadId } }),
  ]);
  revalidatePath("/admin/crm");
}

/** Same "spam wave just hit" cleanup as deleteRecentContactMessages, for
 * the CRM's Lead table. */
export async function deleteRecentLeads(formData: FormData) {
  const admin = await requireAdmin();
  const hours = Number(formData.get("hours")) || 48;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const rows = await prisma.lead.findMany({ where: { createdAt: { gte: cutoff } } });

  await prisma.$transaction([
    ...rows.map((r) =>
      prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "Lead",
          originalId: r.id,
          summary: `Lead: ${r.name}`,
          data: serializeRow(r),
          actor: admin,
        }),
      }),
    ),
    prisma.lead.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } }),
  ]);
  const count = rows.length;
  await logAudit({
    actor: admin,
    action: "leads.bulk_deleted",
    summary: `Deleted ${count} lead${count === 1 ? "" : "s"} from the last ${hours}h (spam cleanup)`,
    metadata: { count, hours },
    severity: "WARNING",
  });
  revalidatePath("/admin/crm");
}

// The "Clients" list on a counselor's admin detail page is derived (grouped
// by email) from that counselor's booking requests + paid session bookings,
// not a single row — so "deleting a client" means clearing all of their
// booking history with this specific counselor.
export async function deleteCounselorClient(formData: FormData) {
  const admin = await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const email = String(formData.get("email"));
  const [bookingRequests, sessionBookings] = await Promise.all([
    prisma.bookingRequest.findMany({ where: { counselorId, email } }),
    prisma.sessionBooking.findMany({ where: { counselorId, email } }),
  ]);

  await prisma.$transaction([
    ...bookingRequests.map((r) =>
      prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "BookingRequest",
          originalId: r.id,
          summary: `Booking request from ${r.name}`,
          data: serializeRow(r),
          actor: admin,
        }),
      }),
    ),
    ...sessionBookings.map((r) =>
      prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "SessionBooking",
          originalId: r.id,
          summary: `Session booking for ${r.name} (${r.priceEGP - r.discountEGP} EGP, ${r.status})`,
          data: serializeRow(r),
          actor: admin,
        }),
      }),
    ),
    prisma.bookingRequest.deleteMany({ where: { counselorId, email } }),
    prisma.sessionBooking.deleteMany({ where: { counselorId, email } }),
  ]);
  const total = bookingRequests.length + sessionBookings.length;
  if (total > 0) {
    await logAudit({
      actor: admin,
      action: "counselor_client.deleted",
      summary: `Deleted ${total} booking record${total === 1 ? "" : "s"} for ${email} with this counselor`,
      targetType: "Counselor",
      targetId: counselorId,
      metadata: { email, bookingRequests: bookingRequests.length, sessionBookings: sessionBookings.length },
      severity: "WARNING",
    });
  }
  revalidatePath("/admin/counselors/[id]", "page");
}

// Same complete-deletion behavior as a client's own "Delete my account" —
// the account and everything that only makes sense tied to it (journal
// entries, push subscriptions, live-chat transcripts) is gone outright;
// past orders and session requests are kept for our records but
// disassociated. If the client is logged in elsewhere, their session
// becomes invalid on their very next request (see getCurrentUser).
export async function deleteClientAccount(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId"));
  const client = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, accountCode: true } });
  await deleteUserAccountCompletely(userId, "admin");
  await logAudit({
    actor: admin,
    action: "client.account_deleted",
    summary: client ? `Deleted client account ${client.email} (${client.accountCode})` : "Deleted a client account",
    targetType: "User",
    targetId: userId,
    severity: "WARNING",
  });
  // A redirect (not just revalidatePath) so this also works from a client's
  // own detail page — staying there after deletion would try to re-render
  // a client that no longer exists.
  redirect("/admin/clients");
}

/** Powers the admin dashboard's global search box — clients only (pages are
 * matched client-side against the static nav). Matches name/email/account
 * code, case-insensitively, substring match. Capped well below the full
 * client list so a broad query (e.g. a common first name) still returns
 * fast and useful results instead of everything. */
export async function searchAdminClients(query: string) {
  await requireAdmin();
  const q = query.trim();
  if (q.length < 2) return [];

  const clients = await prisma.user.findMany({
    where: {
      role: "USER",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { accountCode: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, accountCode: true },
    orderBy: { name: "asc" },
    take: 8,
  });
  return clients;
}

export async function createPromoCode(formData: FormData) {
  const admin = await requireAdmin();
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
  await logAudit({
    actor: admin,
    action: "promo_code.created",
    summary: `Created promo code ${code}`,
    targetType: "PromoCode",
    metadata: { code, discountType, discountValue },
  });
  revalidatePath("/admin/promo-codes");
}

export async function togglePromoCodeActive(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  const updated = await prisma.promoCode.update({ where: { id }, data: { active: !active } });
  await logAudit({
    actor: admin,
    action: "promo_code.toggled",
    summary: `Promo code ${updated.code} ${updated.active ? "activated" : "deactivated"}`,
    targetType: "PromoCode",
    targetId: id,
  });
  revalidatePath("/admin/promo-codes");
}

export async function deletePromoCode(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.promoCode.findUnique({ where: { id }, select: { code: true } });
  if (!existing) return;
  const snapshot = await captureRow("PromoCode", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "PromoCode",
        originalId: id,
        summary: `Promo code ${existing.code}`,
        data: snapshot,
        actor: admin,
      }),
    }),
    // PromoCodeProduct/PromoCodeCounselor cascade at the DB level — already
    // captured as children above, nothing else to clean up by hand here.
    prisma.promoCode.delete({ where: { id } }),
  ]);
  await logAudit({
    actor: admin,
    action: "promo_code.deleted",
    summary: `Deleted promo code ${existing.code}`,
    targetType: "PromoCode",
    targetId: id,
    severity: "WARNING",
  });
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

// Real hard delete — unlike archiving (the "Visible" checkbox), this
// removes the product row outright. Only safe to run when no order has
// ever included it: OrderItem.productId/productVariantId are required
// fields, so deleting a product with order history would either violate
// those foreign keys or, if cascaded, silently erase real purchase
// records. The admin UI only ever renders this action for a product with
// zero orders; this re-check is defense in depth, not the primary gate.
export async function deleteProduct(formData: FormData) {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId"));

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) return;

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { title: true } });
  if (!product) return;
  const snapshot = await captureRow("Product", productId);
  if (!snapshot) return;

  // PromoCodeProduct cascades on delete at the DB level already — only
  // ProductVariant (no order history if we got this far) needs clearing
  // by hand first.
  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "Product",
        originalId: productId,
        summary: `Product "${product.title}"`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.productVariant.deleteMany({ where: { productId } }),
    prisma.product.delete({ where: { id: productId } }),
  ]);
  await logAudit({
    actor: admin,
    action: "product.deleted",
    summary: `Deleted product "${product.title}"`,
    targetType: "Product",
    targetId: productId,
    severity: "WARNING",
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateProductArabicContent(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const titleAr = String(formData.get("titleAr") ?? "").trim() || null;
  const descriptionAr = String(formData.get("descriptionAr") ?? "").trim() || null;
  await prisma.product.update({ where: { id: productId }, data: { titleAr, descriptionAr } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
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

/** Full CRUD for the filter chips shown on /counseling (see
 * CounselorFilter in schema.prisma) — lets an admin add or remove filters
 * without a code change. Per-counselor assignment is a separate action
 * (updateCounselorFilterAssignments), set from /admin/counselors/[id]. */
export async function createCounselingFilter(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const labelAr = String(formData.get("labelAr") ?? "").trim() || null;
  if (!label) return;
  const maxSort = await prisma.counselorFilter.aggregate({ _max: { sortOrder: true } });
  await prisma.counselorFilter.create({
    data: { label, labelAr, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath("/admin/counseling-filters");
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
}

export async function deleteCounselingFilter(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.counselorFilter.findUnique({ where: { id }, select: { label: true } });
  if (!existing) return;
  const snapshot = await captureRow("CounselorFilter", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "CounselorFilter",
        originalId: id,
        summary: `Counseling filter "${existing.label}"`,
        data: snapshot,
        actor: admin,
      }),
    }),
    // CounselorFilterAssignment cascades at the DB level — already
    // captured as a child above.
    prisma.counselorFilter.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/counseling-filters");
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
}

/** Replaces the full set of filters assigned to one counselor with
 * whichever checkboxes were submitted — simpler and less error-prone than
 * diffing add/remove, and this form only ever represents the complete set. */
export async function updateCounselorFilterAssignments(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const filterIds = formData.getAll("filterIds").map(String);
  await prisma.$transaction([
    prisma.counselorFilterAssignment.deleteMany({ where: { counselorId } }),
    prisma.counselorFilterAssignment.createMany({
      data: filterIds.map((filterId) => ({ counselorId, filterId })),
    }),
  ]);
  revalidatePath("/admin/counselors/[id]", "page");
  revalidatePath("/counseling");
}

/** Grants/revokes a counselor's access to edit the shared, sitewide intake
 * form and reflection sheet question sets from their own /therapist
 * portal — see forms-config-auth.ts. */
export async function updateCounselorFormsPermission(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const canEditFormsConfig = formData.get("canEditFormsConfig") === "on";
  const canPrescribeMedication = formData.get("canPrescribeMedication") === "on";
  await prisma.counselor.update({ where: { id: counselorId }, data: { canEditFormsConfig, canPrescribeMedication } });
  revalidatePath("/admin/counselors/[id]", "page");
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

// Sends a one-click, single-use login link — for routine "get this
// therapist back into their account" access, without touching their
// existing password the way sendTherapistPortalSetupLink does. Requires
// portal access (a password) to already be set up; a brand-new counselor
// still goes through the setup-link flow once.
export async function sendTherapistLoginLink(formData: FormData) {
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const counselor = await prisma.counselor.findUnique({ where: { id: counselorId } });
  if (!counselor || !counselor.email || !counselor.passwordHash) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const loginTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.counselor.update({
    where: { id: counselor.id },
    data: {
      loginTokenHash,
      loginTokenExpiresAt: new Date(Date.now() + LOGIN_LINK_TOKEN_TTL_MS),
    },
  });

  const baseUrl = await getBaseUrl();
  const loginUrl = `${baseUrl}/therapist/login/link?token=${rawToken}`;
  await sendTherapistLoginLinkEmail({ to: counselor.email, name: counselor.name, loginUrl });

  revalidatePath("/admin/counselors/[id]", "page");
}

export async function revokeTherapistPortalAccess(formData: FormData) {
  const admin = await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  const counselor = await prisma.counselor.update({
    where: { id: counselorId },
    data: {
      passwordHash: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      loginTokenHash: null,
      loginTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  await logAudit({
    actor: admin,
    action: "counselor.portal_access_revoked",
    summary: `Revoked therapist portal access for ${counselor.name}`,
    targetType: "Counselor",
    targetId: counselorId,
    severity: "SECURITY",
  });
  revalidatePath("/admin/counselors/[id]", "page");
}

// Real hard delete — unlike archiving (the "Visible" checkbox), this
// removes the counselor row outright and immediately cuts off their
// /therapist portal access (see the existence check in getCurrentCounselor,
// therapist-session.ts). Only safe to run when the counselor has no real
// booking/session/referral history, since SessionBooking.counselorId and
// BookingRequest.counselorId are required fields — deleting a counselor
// with history would either violate those foreign keys or, if we cascaded,
// silently erase real accounting/clinical records. The admin UI only ever
// renders this action for a counselor with zero of that history; this
// re-check is defense in depth, not the primary gate.
export async function deleteCounselor(formData: FormData) {
  const admin = await requireAdmin();
  const counselorId = String(formData.get("counselorId"));

  const [sessionBookings, bookingRequests, intakeSubmissions, clientNotes, assignedResources, referralsSent, referralsReceived] =
    await Promise.all([
      prisma.sessionBooking.count({ where: { counselorId } }),
      prisma.bookingRequest.count({ where: { counselorId } }),
      prisma.intakeSubmission.count({ where: { counselorId } }),
      prisma.clientNote.count({ where: { counselorId } }),
      prisma.assignedResource.count({ where: { counselorId } }),
      prisma.referral.count({ where: { fromCounselorId: counselorId } }),
      prisma.referral.count({ where: { toCounselorId: counselorId } }),
    ]);
  const hasHistory =
    sessionBookings + bookingRequests + intakeSubmissions + clientNotes + assignedResources + referralsSent + referralsReceived > 0;
  if (hasHistory) return;

  const counselor = await prisma.counselor.findUnique({ where: { id: counselorId }, select: { name: true } });
  if (!counselor) return;
  const snapshot = await captureRow("Counselor", counselorId);
  if (!snapshot) return;

  // CounselorAvailability, PromoCodeCounselor, and CounselorFilterAssignment
  // cascade on delete at the DB level already (not restored — a counselor
  // deleted with zero history never had availability/promo/filter setup
  // worth re-checking after restore) — only ToolkitItem (a counselor's own
  // personal toolkit config, not client data) needs clearing by hand, and
  // it's captured as a trash child above.
  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "Counselor",
        originalId: counselorId,
        summary: `Counselor ${counselor.name}`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.toolkitItem.deleteMany({ where: { counselorId } }),
    prisma.counselor.delete({ where: { id: counselorId } }),
  ]);
  await logAudit({
    actor: admin,
    action: "counselor.deleted",
    summary: counselor ? `Deleted counselor ${counselor.name}` : "Deleted a counselor",
    targetType: "Counselor",
    targetId: counselorId,
    severity: "WARNING",
  });
  revalidatePath("/admin/counselors");
}

export type SendPushFormState = { error?: string; success?: boolean; sent?: number; total?: number } | undefined;

/** Manual push blast to every subscribed browser — the ad hoc counterpart
 * to the automatic new-event announcement and the daily journal reminder
 * cron, for anything the admin wants to announce on demand. */
export async function sendManualPushNotification(
  _prevState: SendPushFormState,
  formData: FormData,
): Promise<SendPushFormState> {
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const bodyAr = String(formData.get("bodyAr") ?? "").trim();
  const urlRaw = String(formData.get("url") ?? "").trim();

  if (!title) return { error: "Please add a title." };
  if (!body) return { error: "Please add a message." };

  let url = "/upcoming";
  if (urlRaw) {
    if (!urlRaw.startsWith("/")) return { error: "The link should be a path on this site, starting with /" };
    url = urlRaw;
  }

  if (!process.env.VAPID_PRIVATE_KEY) {
    return { error: "Push notifications aren't configured on this deployment yet." };
  }

  // The admin-typed headline is the notification's own title — the app
  // name is already shown by the OS/browser as the notification's source,
  // so repeating "Let It Out" as the title here would just duplicate it.
  const result = await sendPushToAllSubscribers({
    en: { title, body, url },
    ar: { title: titleAr || title, body: bodyAr || body, url },
  });
  await logAudit({
    actor: admin,
    action: "push.manual_send",
    summary: `Sent "${title}" to ${result.sent}/${result.total} subscribers`,
    metadata: { title, sent: result.sent, total: result.total, url },
  });
  return { success: true, sent: result.sent, total: result.total };
}

/**
 * Permanently wipes every tracked page view (feature-usage analytics,
 * average time-spent, and the dashboard's activity heatmap all go back to
 * "no data yet") — for a one-time clean slate, e.g. after a period of
 * internal/QA traffic inflated the numbers. Never touches JournalEntry,
 * Order, SessionBooking, or anything else — PageView is the only table
 * this clears. Irreversible, so it's logged at WARNING like every other
 * bulk-delete admin action.
 */
export async function resetPageViewTracking() {
  const admin = await requireAdmin();
  const { count } = await prisma.pageView.deleteMany({});
  await logAudit({
    actor: admin,
    action: "page_views.reset",
    summary: `Cleared ${count} tracked page view${count === 1 ? "" : "s"}`,
    metadata: { count },
    severity: "WARNING",
  });
  revalidatePath("/admin/analytics");
  revalidatePath("/admin");
}

/**
 * Permanently wipes every submitted feedback rating/comment — for a
 * one-time clean slate (e.g. after internal/QA testing produced
 * submissions that shouldn't count). Same "Danger zone" treatment as
 * resetPageViewTracking: no customer-facing record depends on a feedback
 * row existing, so this is a hard delete rather than routed through
 * TrashedItem. Also resets the Happiness score on the behavioral
 * analytics dashboard, which reads directly from this table.
 */
export async function clearAllFeedback() {
  const admin = await requireAdmin();
  const { count } = await prisma.feedback.deleteMany({});
  await logAudit({
    actor: admin,
    action: "feedback.cleared",
    summary: `Cleared ${count} feedback submission${count === 1 ? "" : "s"}`,
    metadata: { count },
    severity: "WARNING",
  });
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/behavioral-analytics");
}

const PAID_ORDER_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED];

/**
 * Permanently deletes every *paid* order (CONFIRMED/SHIPPED/COMPLETED) and
 * every *confirmed* session booking — a full, one-time wipe of real
 * revenue history, explicitly requested and confirmed destructive by the
 * user. Deliberately NOT scoped to whatever date range the Finance page's
 * picker happens to have selected (that only filters what's displayed —
 * this clears everything). Pending/unconfirmed/cancelled orders and
 * bookings are left untouched, since they were never counted as revenue.
 * Removes real payment records (customers lose their order confirmation
 * pages), so this is the most destructive admin action in the app,
 * logged at WARNING with the exact counts/total deleted.
 */
export async function resetRevenue() {
  const admin = await requireAdmin();

  const [orders, sessions] = await Promise.all([
    prisma.order.findMany({ where: { status: { in: PAID_ORDER_STATUSES } }, include: { items: true } }),
    prisma.sessionBooking.findMany({ where: { status: "CONFIRMED" } }),
  ]);
  const orderIds = orders.map((o) => o.id);
  const sessionIds = sessions.map((s) => s.id);
  const totalRevenueEGP =
    orders.reduce((sum, o) => sum + o.totalEGP, 0) +
    sessions.reduce((sum, s) => sum + (s.priceEGP - s.discountEGP), 0);

  await prisma.$transaction([
    ...orders.map((o) => {
      const { items, ...orderRow } = o;
      return prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "Order",
          originalId: o.id,
          summary: `Order #${o.id.slice(-8).toUpperCase()}`,
          data: serializeRow({ ...orderRow, _children: { items } }),
          actor: admin,
        }),
      });
    }),
    ...sessions.map((s) =>
      prisma.trashedItem.create({
        data: trashedItemCreateArgs({
          modelName: "SessionBooking",
          originalId: s.id,
          summary: `Session booking for ${s.name} (${s.priceEGP - s.discountEGP} EGP, ${s.status})`,
          data: serializeRow(s),
          actor: admin,
        }),
      }),
    ),
    prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.sessionBooking.deleteMany({ where: { id: { in: sessionIds } } }),
  ]);

  await logAudit({
    actor: admin,
    action: "revenue.reset",
    summary: `Cleared all revenue: deleted ${orderIds.length} paid order${orderIds.length === 1 ? "" : "s"} and ${sessionIds.length} confirmed session${sessionIds.length === 1 ? "" : "s"} (${totalRevenueEGP} EGP total)`,
    metadata: { orderCount: orderIds.length, sessionCount: sessionIds.length, totalRevenueEGP },
    severity: "WARNING",
  });

  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/bookings");
  revalidatePath("/upcoming");
}

export type JournalPromptFormState = { error?: string } | undefined;

/** Journal prompts rotate by dayNumber (see getNextPrompt in prompts.ts,
 * used on /journal/new) — each one must be unique so the rotation has no
 * collisions. */
export async function createJournalPrompt(
  _prevState: JournalPromptFormState,
  formData: FormData,
): Promise<JournalPromptFormState> {
  const admin = await requireAdmin();
  const dayNumber = Number(formData.get("dayNumber"));
  const category = String(formData.get("category") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const categoryAr = String(formData.get("categoryAr") || "").trim();
  const textAr = String(formData.get("textAr") || "").trim();

  if (!dayNumber || dayNumber <= 0) return { error: "Day number must be a positive number." };
  if (!category) return { error: "Category is required." };
  if (!text) return { error: "Prompt text is required." };

  const existing = await prisma.journalPrompt.findUnique({ where: { dayNumber } });
  if (existing) return { error: `Day ${dayNumber} is already used by another prompt.` };

  const created = await prisma.journalPrompt.create({
    data: { dayNumber, category, text, categoryAr: categoryAr || null, textAr: textAr || null },
  });
  await logAudit({
    actor: admin,
    action: "journal_prompt.created",
    summary: `Added journal prompt for day ${dayNumber} (${category})`,
    targetType: "JournalPrompt",
    targetId: created.id,
  });
  revalidatePath("/admin/journal-prompts");
}

export async function updateJournalPrompt(
  _prevState: JournalPromptFormState,
  formData: FormData,
): Promise<JournalPromptFormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const dayNumber = Number(formData.get("dayNumber"));
  const category = String(formData.get("category") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const categoryAr = String(formData.get("categoryAr") || "").trim();
  const textAr = String(formData.get("textAr") || "").trim();

  if (!dayNumber || dayNumber <= 0) return { error: "Day number must be a positive number." };
  if (!category) return { error: "Category is required." };
  if (!text) return { error: "Prompt text is required." };

  const conflict = await prisma.journalPrompt.findUnique({ where: { dayNumber } });
  if (conflict && conflict.id !== id) return { error: `Day ${dayNumber} is already used by another prompt.` };

  await prisma.journalPrompt.update({
    where: { id },
    data: { dayNumber, category, text, categoryAr: categoryAr || null, textAr: textAr || null },
  });
  await logAudit({
    actor: admin,
    action: "journal_prompt.updated",
    summary: `Updated journal prompt for day ${dayNumber} (${category})`,
    targetType: "JournalPrompt",
    targetId: id,
  });
  revalidatePath("/admin/journal-prompts");
}

export async function deleteJournalPrompt(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.journalPrompt.findUnique({ where: { id }, select: { dayNumber: true, category: true } });
  if (!existing) return;
  const snapshot = await captureRow("JournalPrompt", id);
  if (!snapshot) return;

  await prisma.$transaction([
    prisma.trashedItem.create({
      data: trashedItemCreateArgs({
        modelName: "JournalPrompt",
        originalId: id,
        summary: `Journal prompt for day ${existing.dayNumber} (${existing.category})`,
        data: snapshot,
        actor: admin,
      }),
    }),
    prisma.journalPrompt.delete({ where: { id } }),
  ]);
  await logAudit({
    actor: admin,
    action: "journal_prompt.deleted",
    summary: `Deleted journal prompt for day ${existing.dayNumber} (${existing.category})`,
    targetType: "JournalPrompt",
    targetId: id,
  });
  revalidatePath("/admin/journal-prompts");
}
