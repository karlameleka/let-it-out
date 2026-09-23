import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { verifyOrderAccessToken } from "@/lib/order-access";

const requestSchema = (
  body: unknown,
): { orderId: string; paymentMethod: "card" | "wallet"; accessToken?: string } | null => {
  if (typeof body !== "object" || body === null) return null;
  const { orderId, paymentMethod, accessToken } = body as Record<string, unknown>;
  if (typeof orderId !== "string" || !orderId) return null;
  if (paymentMethod !== "card" && paymentMethod !== "wallet") return null;
  if (accessToken !== undefined && typeof accessToken !== "string") return null;
  return { orderId, paymentMethod, accessToken };
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
  const { orderId, paymentMethod, accessToken } = parsed;

  // The order (and its server-computed total) must already exist — we never
  // accept a client-submitted amount for a payment gateway charge.
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Same ownership rule as the confirmation page (see order-access.ts) —
  // otherwise anyone who knows/guesses an order id could trigger a payment
  // attempt (and everything the resulting webhook confirms) on it.
  const user = await getCurrentUser();
  const isOwner = (user && order.userId === user.userId) || verifyOrderAccessToken(accessToken, order.accessTokenHash);
  if (!isOwner) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.paymentMethod !== "PAYMOB") {
    return NextResponse.json({ error: "This order is not set up for card/wallet payment." }, { status: 400 });
  }
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "This order has already been processed." }, { status: 409 });
  }

  const integrationId =
    paymentMethod === "wallet" ? process.env.PAYMOB_INTEGRATION_ID_WALLET : process.env.PAYMOB_INTEGRATION_ID_CARD;

  if (!process.env.PAYMOB_SECRET_KEY || !process.env.PAYMOB_PUBLIC_KEY || !integrationId) {
    console.error("[paymob] Missing PAYMOB_SECRET_KEY / PAYMOB_PUBLIC_KEY / integration ID env vars.");
    return NextResponse.json({ error: "Card payment is not available right now." }, { status: 503 });
  }

  const amountInPiastres = Math.round(order.totalEGP * 100);
  const [firstName, ...rest] = order.guestName.trim().split(/\s+/);
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
        // so we can reconcile the callback with this exact Order record.
        special_reference: order.id,
        // Where Paymob sends the customer back to after paying — the order
        // confirmation page, which confirms the order once the webhook has
        // confirmed payment. Carries the access token through the redirect
        // round trip so a guest (no login session) can still view that page
        // afterward — see order-access.ts. Mirrors paymob-session/route.ts;
        // previously left unset here, relying on a default configured in the
        // Paymob merchant dashboard instead of in code.
        redirection_url: `${origin}/orders/${order.id}${accessToken ? `?token=${accessToken}` : ""}`,
        billing_data: {
          first_name: firstName || "Guest",
          last_name: rest.join(" ") || "Customer",
          email: order.guestEmail,
          phone_number: order.guestPhone,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The secret key's own mode prefix (e.g. egy_sk_test_ / egy_sk_live_)
      // is not sensitive on its own — logging just that prefix (never the
      // full key) lets us catch a test/live key vs. integration ID mismatch
      // from the response alone, without exposing any Vercel env values.
      console.error("[paymob] Intention creation failed:", data, {
        integrationId,
        secretKeyPrefix: process.env.PAYMOB_SECRET_KEY?.slice(0, 12),
      });
      return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
    }

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${data.client_secret}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("[paymob] Network error creating intention:", err);
    return NextResponse.json({ error: "Could not reach the payment gateway. Please try again." }, { status: 502 });
  }
}
