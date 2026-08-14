import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, customer, paymentMethod } = await req.json();

    const integrationId =
      paymentMethod === 'wallet'
        ? process.env.PAYMOB_INTEGRATION_ID_WALLET
        : process.env.PAYMOB_INTEGRATION_ID_CARD;

    const amountInPiastres = Math.round(amount * 100);

    const response = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInPiastres,
        currency: 'EGP',
        payment_methods: [parseInt(integrationId || '0')],
        billing_data: {
          first_name: customer?.firstName || 'Valued',
          last_name: customer?.lastName || 'Client',
          email: customer?.email || 'client@letitout.ae',
          phone_number: customer?.phone || '+201000000000',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to initialize Paymob payment');
    }

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${data.client_secret}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}