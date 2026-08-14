import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transaction = body.obj;

    if (transaction && transaction.success === true) {
      const orderId = transaction.order?.id;
      console.log(`✅ Payment Successful for Order #${orderId}`);
    } else {
      console.log(`❌ Payment failed or cancelled for transaction #${transaction?.id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}