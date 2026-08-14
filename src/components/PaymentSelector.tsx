'use client';

import { useState } from 'react';

interface PaymentProps {
  amount: number;
  userEmail: string;
  userPhone?: string;
}

export default function PaymentSelector({ amount, userEmail, userPhone }: PaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePaymobCheckout = async (method: 'card' | 'wallet') => {
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/paymob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod: method,
          customer: {
            email: userEmail,
            phone: userPhone,
          },
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Paymob notice: ' + (data.error || 'Account credentials pending approval.'));
        setLoading(false);
      }
    } catch (err) {
      alert('Network error initiating payment.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-md my-4">
      <button
        onClick={() => handlePaymobCheckout('card')}
        disabled={loading}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-xl transition disabled:opacity-50"
      >
        {loading ? 'Connecting to gateway...' : `Pay ${amount} EGP with Card`}
      </button>

      <button
        onClick={() => handlePaymobCheckout('wallet')}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition disabled:opacity-50"
      >
        {loading ? 'Connecting to gateway...' : `Pay ${amount} EGP with Vodafone Cash / Wallet`}
      </button>
    </div>
  );
}