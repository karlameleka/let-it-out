"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendSupportNotification } from "@/lib/email";
import { formatEGP } from "@/lib/format";

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
  paymentMethod: z.enum(["INSTAPAY", "CASH_ON_DELIVERY"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderResult = { error: string } | { orderId: string };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { items, guestName, guestEmail, guestPhone, shippingAddress, paymentMethod } = parsed.data;

  const variantIds = [...new Set(items.map((i) => i.productVariantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return { error: "One or more items in your cart are no longer available." };
  }

  const needsShipping = items.some((i) => {
    const v = variants.find((v) => v.id === i.productVariantId)!;
    return v.format === "PHYSICAL";
  });

  if (needsShipping && !shippingAddress) {
    return { error: "Please enter a shipping address for physical items." };
  }

  if (paymentMethod === "CASH_ON_DELIVERY" && !needsShipping) {
    return { error: "Cash on Delivery is only available when your order includes a physical journal." };
  }

  let totalEGP = 0;
  const orderItemsData = items.map((i) => {
    const v = variants.find((v) => v.id === i.productVariantId)!;
    totalEGP += v.priceEGP * i.quantity;
    return {
      productId: v.productId,
      productVariantId: v.id,
      quantity: i.quantity,
      unitPriceEGP: v.priceEGP,
      titleSnapshot: v.product.title,
      formatSnapshot: v.format,
    };
  });

  const user = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: user?.userId,
      guestName,
      guestEmail,
      guestPhone,
      shippingAddress: needsShipping ? shippingAddress : null,
      needsShipping,
      subtotalEGP: totalEGP,
      totalEGP,
      paymentMethod,
      // Cash on Delivery has no online payment step to wait on — the order
      // goes straight to confirmed, and cash is collected on delivery.
      status: paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "PENDING_PAYMENT",
      items: { create: orderItemsData },
    },
  });

  const itemsSummary = orderItemsData
    .map((i) => `${i.titleSnapshot} (${i.formatSnapshot === "PHYSICAL" ? "Physical" : "Ebook"}) x${i.quantity}`)
    .join("\n");

  await sendSupportNotification({
    subject: "New journal order",
    lines: [
      { label: "Order #", value: order.id.slice(-8).toUpperCase() },
      { label: "Customer", value: guestName },
      { label: "Email", value: guestEmail },
      { label: "Phone", value: guestPhone },
      { label: "Items", value: itemsSummary },
      { label: "Total", value: formatEGP(totalEGP) },
      { label: "Payment method", value: paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "InstaPay" },
      { label: "Shipping address", value: needsShipping ? (shippingAddress ?? "—") : "N/A (ebook only)" },
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
