import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendCustomerConfirmation } from "@/lib/email";
import { formatEGP } from "@/lib/format";

/**
 * Field order Paymob uses to build the HMAC digest for the "TRANSACTION"
 * webhook (documented at developers.paymob.com/egypt/webhooks). Verify
 * this against the current Paymob dashboard docs before relying on it in
 * production — it could not be re-confirmed live from this environment.
 */
const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

function getField(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return value === undefined || value === null ? "" : String(value);
}

function isValidHmac(obj: Record<string, unknown>, receivedHmac: string, secret: string): boolean {
  const concatenated = HMAC_FIELDS.map((field) => getField(obj, field)).join("");
  const computed = createHmac("sha512", secret).update(concatenated).digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(receivedHmac, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) {
    console.error("[paymob webhook] PAYMOB_HMAC_SECRET is not configured — refusing to process callback.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const receivedHmac = req.nextUrl.searchParams.get("hmac");
  if (!receivedHmac) {
    return NextResponse.json({ error: "Missing hmac." }, { status: 400 });
  }

  let body: { obj?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const transaction = body.obj;
  if (!transaction) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!isValidHmac(transaction, receivedHmac, secret)) {
    console.warn("[paymob webhook] HMAC verification failed — rejecting callback.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const order = transaction.order as Record<string, unknown> | undefined;
  const referenceId = typeof order?.merchant_order_id === "string" ? order.merchant_order_id : undefined;
  const success = transaction.success === true;

  if (!referenceId) {
    console.warn("[paymob webhook] Verified callback had no merchant_order_id; nothing to reconcile.");
    return NextResponse.json({ received: true });
  }

  const transactionId =
    typeof transaction.id === "number" || typeof transaction.id === "string" ? String(transaction.id) : undefined;

  const existingOrder = await prisma.order.findUnique({ where: { id: referenceId } });
  if (existingOrder && existingOrder.paymentMethod === "PAYMOB") {
    // Idempotent: only act the first time we see this order move out of
    // PENDING_PAYMENT, so retried webhook deliveries are harmless.
    if (existingOrder.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ received: true });
    }

    if (success) {
      await prisma.order.update({
        where: { id: referenceId },
        data: { status: "CONFIRMED", paymentRef: transactionId },
      });

      await sendCustomerConfirmation({
        to: existingOrder.guestEmail,
        name: existingOrder.guestName,
        subject: "Payment received — your order is confirmed",
        intro: `Thanks! We've received your payment of ${formatEGP(existingOrder.totalEGP)} and your order is confirmed.`,
        lines: [{ label: "Order #", value: existingOrder.id.slice(-8).toUpperCase() }],
      });
    } else {
      await prisma.order.update({
        where: { id: referenceId },
        data: { paymentNote: "Paymob payment attempt failed or was cancelled; order remains pending payment." },
      });
    }

    return NextResponse.json({ received: true });
  }

  const existingSessionBooking = await prisma.sessionBooking.findUnique({
    where: { id: referenceId },
    include: { counselor: true },
  });
  if (existingSessionBooking) {
    // Same idempotency guard as above, applied to session bookings.
    if (existingSessionBooking.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ received: true });
    }

    if (success) {
      await prisma.sessionBooking.update({
        where: { id: referenceId },
        data: { status: "CONFIRMED", paymentRef: transactionId },
      });

      await sendCustomerConfirmation({
        to: existingSessionBooking.email,
        name: existingSessionBooking.name,
        subject: "Payment received — pick your session time",
        intro: `Thanks! We've received your payment of ${formatEGP(existingSessionBooking.priceEGP - existingSessionBooking.discountEGP)} for a session with ${existingSessionBooking.counselor.name}. Head back to pick your exact time.`,
        lines: [{ label: "Counselor", value: existingSessionBooking.counselor.name }],
      });
    } else {
      await prisma.sessionBooking.update({
        where: { id: referenceId },
        data: { paymentNote: "Paymob payment attempt failed or was cancelled; booking remains pending payment." },
      });
    }

    return NextResponse.json({ received: true });
  }

  console.warn(`[paymob webhook] No matching order or session booking found for id ${referenceId}.`);
  return NextResponse.json({ received: true });
}
