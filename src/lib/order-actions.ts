"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { formatEGP } from "@/lib/format";
import { computeShippingFeeEGP } from "@/lib/shipping";
import { COUNTRIES, EGYPT_GOVERNORATES } from "@/lib/content/geo";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  INSTAPAY: "InstaPay",
  CASH_ON_DELIVERY: "Cash",
  PAYMOB: "Credit Card",
};

const itemSchema = z.object({
  productVariantId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  guestName: z.string().trim().min(1, "Please enter your name."),
  guestEmail: z.string().trim().email("Please enter a valid email."),
  guestPhone: z.string().trim().min(5, "Please enter a valid phone number."),
  shippingAddress: z.string().trim().optional(),
  googleMapsLink: z.string().trim().optional(),
  country: z.string().trim().optional(),
  governorate: z.string().trim().optional(),
  paymentMethod: z.enum(["INSTAPAY", "CASH_ON_DELIVERY", "PAYMOB"]),
  promoCode: z.string().trim().optional(),
});

export type PromoCheckResult =
  | { valid: true; code: string; discountEGP: number; label: string }
  | { valid: false; error: string };

export type PromoCartItem = { productSlug: string; priceEGP: number; quantity: number };

/** Server-computed discount preview — never trust a client-submitted amount.
    Re-validated again inside createOrder at the moment the order is placed.
    A promo scoped to specific products only discounts those products' share
    of the cart, not the whole subtotal — the minimum-order check still looks
    at the full cart total, since that's a threshold on the order as a whole. */
export async function checkPromoCode(rawCode: string, items: PromoCartItem[]): Promise<PromoCheckResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "Enter a code." };

  const subtotalEGP = items.reduce((sum, i) => sum + i.priceEGP * i.quantity, 0);

  const promo = await prisma.promoCode.findUnique({
    where: { code },
    include: { products: { include: { product: true } } },
  });
  if (!promo || !promo.active) return { valid: false, error: "That code isn't valid." };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, error: "That code has expired." };
  if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
    return { valid: false, error: "That code has already been fully redeemed." };
  }
  if (promo.minOrderEGP !== null && subtotalEGP < promo.minOrderEGP) {
    return { valid: false, error: `This code needs a minimum order of ${formatEGP(promo.minOrderEGP)}.` };
  }

  const scopedSlugs = promo.products.map((p) => p.product.slug);
  const eligibleItems = scopedSlugs.length === 0 ? items : items.filter((i) => scopedSlugs.includes(i.productSlug));
  const eligibleSubtotalEGP = eligibleItems.reduce((sum, i) => sum + i.priceEGP * i.quantity, 0);
  if (eligibleSubtotalEGP === 0) {
    return { valid: false, error: "This code doesn't apply to anything in your cart." };
  }

  const discountEGP =
    promo.discountType === "PERCENT"
      ? Math.round((eligibleSubtotalEGP * promo.discountValue) / 100)
      : Math.min(promo.discountValue, eligibleSubtotalEGP);

  const label = promo.discountType === "PERCENT" ? `${promo.discountValue}% off` : `${formatEGP(promo.discountValue)} off`;

  return { valid: true, code, discountEGP, label };
}

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderResult = { error: string } | { orderId: string };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const {
    items,
    guestName,
    guestEmail,
    guestPhone,
    shippingAddress,
    googleMapsLink,
    country,
    governorate,
    paymentMethod,
    promoCode,
  } = parsed.data;

  const variantIds = [...new Set(items.map((i) => i.productVariantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return { error: "One or more items in your cart are no longer available." };
  }

  for (const i of items) {
    const v = variants.find((v) => v.id === i.productVariantId)!;
    if (v.stockCount !== null && v.stockCount < i.quantity) {
      return {
        error:
          v.stockCount === 0
            ? `${v.product.title} is out of stock.`
            : `Only ${v.stockCount} of ${v.product.title} left in stock.`,
      };
    }
  }

  const needsShipping = items.some((i) => {
    const v = variants.find((v) => v.id === i.productVariantId)!;
    return v.format === "PHYSICAL";
  });

  if (needsShipping && !shippingAddress) {
    return { error: "Please enter a shipping address for physical items." };
  }

  if (needsShipping && !country) {
    return { error: "Please select your country." };
  }

  if (needsShipping && country && !COUNTRIES.includes(country)) {
    return { error: "Please select a valid country." };
  }

  if (needsShipping && country === "Egypt" && !governorate) {
    return { error: "Please select your governorate." };
  }

  if (needsShipping && country === "Egypt" && governorate && !EGYPT_GOVERNORATES.includes(governorate)) {
    return { error: "Please select a valid governorate." };
  }

  if (paymentMethod === "CASH_ON_DELIVERY" && !needsShipping) {
    return { error: "Cash on Delivery is only available when your order includes a physical journal." };
  }

  let subtotalEGP = 0;
  const orderItemsData = items.map((i) => {
    const v = variants.find((v) => v.id === i.productVariantId)!;
    subtotalEGP += v.priceEGP * i.quantity;
    return {
      productId: v.productId,
      productVariantId: v.id,
      quantity: i.quantity,
      unitPriceEGP: v.priceEGP,
      titleSnapshot: v.product.title,
      formatSnapshot: v.format,
    };
  });

  // Shipping fee is always computed server-side from the validated country —
  // never trust a client-submitted amount. Same for the promo discount: the
  // client may have shown a preview, but it's re-validated here from scratch.
  const shippingFeeEGP = needsShipping && country ? computeShippingFeeEGP(country) : 0;
  const shippingCalculatedOnDelivery = needsShipping && country !== "Egypt";

  let discountEGP = 0;
  let promoCodeId: string | null = null;
  if (promoCode) {
    const promoItems: PromoCartItem[] = items.map((i) => {
      const v = variants.find((v) => v.id === i.productVariantId)!;
      return { productSlug: v.product.slug, priceEGP: v.priceEGP, quantity: i.quantity };
    });
    const check = await checkPromoCode(promoCode, promoItems);
    if (!check.valid) return { error: check.error };
    discountEGP = check.discountEGP;
    promoCodeId = (await prisma.promoCode.findUnique({ where: { code: check.code } }))!.id;
  }

  const totalEGP = subtotalEGP - discountEGP + shippingFeeEGP;

  const user = await getCurrentUser();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user?.userId,
        guestName,
        guestEmail,
        guestPhone,
        shippingAddress: needsShipping ? shippingAddress : null,
        googleMapsLink: needsShipping ? googleMapsLink : null,
        country: needsShipping ? country : null,
        governorate: needsShipping && country === "Egypt" ? governorate : null,
        needsShipping,
        subtotalEGP,
        shippingFeeEGP,
        promoCodeId,
        discountEGP,
        totalEGP,
        paymentMethod,
        // Cash on Delivery has no online payment step to wait on — the order
        // goes straight to confirmed, and cash is collected on delivery.
        status: paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "PENDING_PAYMENT",
        items: { create: orderItemsData },
      },
    });
    if (promoCodeId) {
      await tx.promoCode.update({ where: { id: promoCodeId }, data: { redemptionCount: { increment: 1 } } });
    }
    for (const i of items) {
      const v = variants.find((v) => v.id === i.productVariantId)!;
      if (v.stockCount !== null) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { stockCount: { decrement: i.quantity } },
        });
      }
    }
    return created;
  });

  const itemsSummary = orderItemsData
    .map((i) => `${i.titleSnapshot} x${i.quantity}`)
    .join("\n");
  const orderNotes = `Order #${order.id.slice(-8).toUpperCase()}\n${itemsSummary}`;
  const crmPaymentMethodLabel = PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;

  await createLead({
    name: guestName,
    type: "JOURNAL_CUSTOMER",
    status: order.status === "CONFIRMED" ? "CONVERTED" : "QUALIFIED",
    email: guestEmail,
    phone: guestPhone,
    source: "Website",
    orderTotalEGP: totalEGP,
    paymentMethod: crmPaymentMethodLabel,
    notes: orderNotes,
  });

  await syncLeadToAirtable({
    Name: guestName,
    Type: "Journal Customer",
    Status: order.status === "CONFIRMED" ? "Converted" : "Qualified",
    Email: guestEmail,
    Phone: guestPhone,
    Source: "Website",
    "Order Total": totalEGP,
    "Payment Method": crmPaymentMethodLabel,
    Notes: orderNotes,
  });

  const shippingFeeSummary = !needsShipping
    ? "N/A (ebook only)"
    : shippingCalculatedOnDelivery
      ? "Calculated upon delivery (outside Egypt)"
      : formatEGP(shippingFeeEGP);

  const paymentMethodLabel =
    paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : paymentMethod === "PAYMOB" ? "Card / Wallet (Paymob)" : "InstaPay";

  await sendSupportNotification({
    subject: "New journal order",
    lines: [
      { label: "Order #", value: order.id.slice(-8).toUpperCase() },
      { label: "Customer", value: guestName },
      { label: "Email", value: guestEmail },
      { label: "Phone", value: guestPhone },
      { label: "Items", value: itemsSummary },
      { label: "Subtotal", value: formatEGP(subtotalEGP) },
      ...(discountEGP > 0 ? [{ label: "Discount", value: `-${formatEGP(discountEGP)}` }] : []),
      { label: "Shipping fee", value: shippingFeeSummary },
      { label: "Total", value: formatEGP(totalEGP) },
      { label: "Payment method", value: paymentMethodLabel },
      { label: "Country", value: needsShipping ? (country ?? "—") : "N/A (ebook only)" },
      { label: "Governorate", value: needsShipping && country === "Egypt" ? (governorate ?? "—") : "N/A" },
      { label: "Shipping address", value: needsShipping ? (shippingAddress ?? "—") : "N/A (ebook only)" },
      { label: "Google Maps link", value: needsShipping ? (googleMapsLink ?? "—") : "N/A" },
    ],
  });

  const isPendingOnlinePayment = paymentMethod === "PAYMOB" || paymentMethod === "INSTAPAY";

  await sendCustomerConfirmation({
    to: guestEmail,
    name: guestName,
    subject: isPendingOnlinePayment ? "Complete your payment" : "Your order is confirmed",
    intro: isPendingOnlinePayment
      ? `Thanks for your order! Complete your payment of ${formatEGP(totalEGP)} to confirm it.`
      : `Thanks for your order! It's confirmed and will ship soon — pay ${formatEGP(totalEGP)} in cash when it arrives.`,
    lines: [
      { label: "Order #", value: order.id.slice(-8).toUpperCase() },
      { label: "Items", value: itemsSummary },
      { label: "Subtotal", value: formatEGP(subtotalEGP) },
      ...(discountEGP > 0 ? [{ label: "Discount", value: `-${formatEGP(discountEGP)}` }] : []),
      { label: "Shipping fee", value: shippingFeeSummary },
      { label: "Total", value: formatEGP(totalEGP) },
    ],
  });

  return { orderId: order.id };
}

const paymentRefSchema = z.object({
  orderId: z.string().min(1),
  paymentRef: z.string().trim().min(2, "Please enter your InstaPay transaction reference."),
  paymentNote: z.string().trim().optional(),
});

export type PaymentRefFormState = { error?: string; success?: boolean } | undefined;

export async function submitPaymentReference(
  _prevState: PaymentRefFormState,
  formData: FormData,
): Promise<PaymentRefFormState> {
  const parsed = paymentRefSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentRef: formData.get("paymentRef"),
    paymentNote: formData.get("paymentNote") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return { error: "Order not found." };
  if (order.status !== "PENDING_PAYMENT") {
    return { success: true };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAYMENT_SUBMITTED",
      paymentRef: parsed.data.paymentRef,
      paymentNote: parsed.data.paymentNote,
    },
  });

  return { success: true };
}
