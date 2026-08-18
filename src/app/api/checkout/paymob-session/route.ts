import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const requestSchema = (
  body: unknown,
): { sessionBookingId: string; paymentMethod: "card" | "wallet" } | null => {
  if (typeof body !== "object" || body === null) return null;
  const { sessionBookingId, paymentMethod } = body as Record<string, unknown>;
  if (typeof sessionBookingId !== "string" || !sessionBookingId) return null;
  if (paymentMethod !== "card" && paymentMethod !== "wallet") return null;
  return { sessionBookingId, paymentMethod };
};

export async function POST(req: Request) {
  let parsed: ReturnType<typeof requestSchema>;
  try {
    parsed = requestSchema(await req.json());
  } catch {
    parsed = null;
  }
  if (!parsed) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { sessionBookingId, paymentMethod } = parsed;

  // The booking (and its server-computed price) must already exist — we
  // never accept a client-submitted amount for a payment gateway charge.
  const booking = await prisma.sessionBooking.findUnique({ where: { id: sessionBookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "This booking has already been paid." }, { status: 409 });
  }

  const integrationId =
    paymentMethod === "wallet" ? process.env.PAYMOB_INTEGRATION_ID_WALLET : process.env.PAYMOB_INTEGRATION_ID_CARD;

  if (!process.env.PAYMOB_SECRET_KEY || !process.env.PAYMOB_PUBLIC_KEY || !integrationId) {
    console.error("[paymob] Missing PAYMOB_SECRET_KEY / PAYMOB_PUBLIC_KEY / integration ID env vars.");
    return NextResponse.json({ error: "Card payment is not available right now." }, { status: 503 });
  }

  const amountInPiastres = Math.round((booking.priceEGP - booking.discountEGP) * 100);
  const [firstName, ...rest] = booking.name.trim().split(/\s+/);
  const origin = new URL(req.url).origin;

  try {
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInPiastres,
        currency: "EGP",
        payment_methods: [parseInt(integrationId, 10)],
        // Echoed back on the transaction webhook as order.merchant_order_id,
        // so we can reconcile the callback with this exact SessionBooking.
        special_reference: booking.id,
        // Where Paymob sends the customer back to after paying — the
        // session-booking status page, which reveals the Cal.com scheduler
        // once the webhook has confirmed payment.
        redirection_url: `${origin}/counseling/session/${booking.id}`,
        billing_data: {
          first_name: firstName || "Guest",
          last_name: rest.join(" ") || "Customer",
          email: booking.email,
          phone_number: booking.phone,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[paymob] Intention creation failed:", data);
      return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
    }

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${data.client_secret}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("[paymob] Network error creating intention:", err);
    return NextResponse.json({ error: "Could not reach the payment gateway. Please try again." }, { status: 502 });
  }
}
