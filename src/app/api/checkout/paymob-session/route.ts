import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { verifyOrderAccessToken } from "@/lib/order-access";

const requestSchema = (body: unknown): { sessionBookingId: string; accessToken?: string } | null => {
  if (typeof body !== "object" || body === null) return null;
  const { sessionBookingId, accessToken } = body as Record<string, unknown>;
  if (typeof sessionBookingId !== "string" || !sessionBookingId) return null;
  if (accessToken !== undefined && typeof accessToken !== "string") return null;
  return { sessionBookingId, accessToken };
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
  const { sessionBookingId, accessToken } = parsed;

  // The booking (and its server-computed price) must already exist — we
  // never accept a client-submitted amount for a payment gateway charge.
  const booking = await prisma.sessionBooking.findUnique({ where: { id: sessionBookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  // Same ownership rule as the confirmation page (see order-access.ts) —
  // otherwise anyone who knows/guesses a booking id could trigger a payment
  // attempt (and everything the resulting webhook confirms) on it.
  const user = await getCurrentUser();
  const isOwner = (user && user.email === booking.email) || verifyOrderAccessToken(accessToken, booking.accessTokenHash);
  if (!isOwner) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "This booking has been cancelled." }, { status: 409 });
  }
  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "This booking has already been paid." }, { status: 409 });
  }

  // Every configured integration is offered on Paymob's own unified
  // checkout page — the customer picks card vs. wallet there instead of on
  // this site, so there's a single "Checkout Now" button instead of one
  // button per method.
  const integrationIds = [process.env.PAYMOB_INTEGRATION_ID_CARD, process.env.PAYMOB_INTEGRATION_ID_WALLET].filter(
    (id): id is string => Boolean(id),
  );

  if (!process.env.PAYMOB_SECRET_KEY || !process.env.PAYMOB_PUBLIC_KEY || integrationIds.length === 0) {
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
        payment_methods: integrationIds.map((id) => parseInt(id, 10)),
        // Echoed back on the transaction webhook as order.merchant_order_id,
        // so we can reconcile the callback with this exact SessionBooking.
        special_reference: booking.id,
        // Where Paymob sends the customer back to after paying — the
        // session-booking status page, which confirms the booking once
        // the webhook has confirmed payment. Carries the access token
        // through the redirect round trip so a guest (no login session)
        // can still view that page afterward — see order-access.ts.
        redirection_url: `${origin}/counseling/session/${booking.id}${accessToken ? `?token=${accessToken}` : ""}`,
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
      // The secret key's own mode prefix (e.g. egy_sk_test_ / egy_sk_live_)
      // is not sensitive on its own — logging just that prefix (never the
      // full key) lets us catch a test/live key vs. integration ID mismatch
      // from the response alone, without exposing any Vercel env values.
      console.error("[paymob] Intention creation failed:", data, {
        integrationIds,
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
