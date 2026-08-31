"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendPasswordResetEmail, sendTherapistLoginLinkEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";
import { deleteUserAccountCompletely } from "@/lib/account-deletion";
import { sendPushToAllSubscribers } from "@/lib/web-push";

const PORTAL_SETUP_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const LOGIN_LINK_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

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
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  await prisma.sessionBooking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });

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
  if (!meetingLink.ok) return { error: "That meeting link doesn't look valid — include https://" };

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
  if (!meetingLink.ok) return { error: "That meeting link doesn't look valid — include https://" };

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
  await deleteUserAccountCompletely(userId, "admin");
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
  await requireAdmin();
  const counselorId = String(formData.get("counselorId"));
  await prisma.counselor.update({
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
  await requireAdmin();
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

  // CounselorAvailability and PromoCodeCounselor cascade on delete at the
  // DB level already — only ToolkitItem (a counselor's own personal
  // toolkit config, not client data) needs clearing by hand first.
  await prisma.$transaction([
    prisma.toolkitItem.deleteMany({ where: { counselorId } }),
    prisma.counselor.delete({ where: { id: counselorId } }),
  ]);
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
  await requireAdmin();

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
  return { success: true, sent: result.sent, total: result.total };
}
