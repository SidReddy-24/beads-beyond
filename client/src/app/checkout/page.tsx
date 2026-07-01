'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, CreditCard, Truck } from 'lucide-react';

export default function Checkout() {
  const { cart, coupon, clearCart, token, apiBase, user } = useApp();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock checkout modal state
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderId, setMockOrderId] = useState('');
  const [mockAmount, setMockAmount] = useState(0);

  const subtotal = cart.reduce((total, item) => {
    const price = item.product.price * (1 - item.product.discount / 100);
    return total + price * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'Percentage') {
      discountAmount = subtotal * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }
  }

  const payableTotal = Math.max(subtotal - discountAmount, 0);

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/checkout');
    }
  }, [token]);

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone || !address || !city || !state || !pincode) {
      setError('Please fill in all shipping details.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on Express Server
      const orderRes = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity
          })),
          couponCode: coupon?.code,
          shippingAddress: { name, email, phone, address, city, state, pincode },
          paymentMethod
        })
      });

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        setError(orderJson.message || 'Failed to place order.');
        setLoading(false);
        return;
      }

      const createdOrder = orderJson.data;

      // 2. Handle payment routing
      if (paymentMethod === 'COD') {
        clearCart();
        router.push(`/account/orders?success=true`);
      } else {
        // Razorpay checkout flow
        const payRes = await fetch(`${apiBase}/payments/razorpay/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: payableTotal,
            orderId: createdOrder._id
          })
        });

        const payJson = await payRes.json();
        if (!payJson.success) {
          setError('Payment order creation failed.');
          setLoading(false);
          return;
        }

        if (payJson.isMock) {
          // If backend runs with mock credentials, trigger fallback simulation modal
          setMockOrderId(payJson.order.id);
          setMockAmount(payJson.order.amount / 100);
          setShowMockModal(true);
          setLoading(false);
          return;
        }

        // Live/Sandbox Razorpay SDK Flow
        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded) {
          setError('Razorpay SDK failed to load. Please check your connection.');
          setLoading(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: payJson.order.amount,
          currency: 'INR',
          name: 'Beads & Beyond',
          description: 'Timeless Premium Jewelry Checkout',
          order_id: payJson.order.id,
          handler: async function (response: any) {
            const verifyRes = await fetch(`${apiBase}/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: createdOrder._id
              })
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              clearCart();
              router.push('/account/orders?success=true');
            } else {
              setError('Payment verification failed.');
            }
          },
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: '#C9A96E'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during checkout.');
      setLoading(false);
    }
  };

  const handleSimulateMockPayment = async () => {
    setLoading(true);
    try {
      // Find created order from account/orders or simply pass the details.
      // We will verify the mock transaction directly on backend.
      const lastOrderRes = await fetch(`${apiBase}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lastOrderJson = await lastOrderRes.json();
      if (!lastOrderJson.success || lastOrderJson.data.length === 0) {
        setError('Unable to find matching order to simulate.');
        setShowMockModal(false);
        setLoading(false);
        return;
      }
      
      const orderId = lastOrderJson.data[0]._id;

      const verifyRes = await fetch(`${apiBase}/payments/razorpay/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpayOrderId: mockOrderId,
          razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(7),
          razorpaySignature: 'sig_mock_' + Math.random().toString(36).substring(7),
          orderId
        })
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        clearCart();
        router.push('/account/orders?success=true');
      } else {
        setError('Simulation verification failed.');
      }
    } catch (err) {
      setError('Mock simulation error.');
    } finally {
      setShowMockModal(false);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-poppins">
        <h2 className="text-xl">Your cart is empty. Please add items before checking out.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <h1 className="text-3xl font-serif mb-8" style={{ color: 'var(--fg)' }}>Checkout</h1>

      {error && (
        <div className="bg-red-50 text-red-500 text-xs p-4 rounded mb-6 border border-red-100 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Shipping Form */}
        <div className="space-y-6 p-6 border luxury-shadow" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
          <h2 className="text-xl font-serif border-b pb-4" style={{ color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}>Shipping Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-luxury"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-luxury"
                  placeholder="98765 43210"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>Delivery Address</label>
              <input
                type="text"
                required
                placeholder="House / Apartment / Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-luxury"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>City</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="input-luxury" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>State</label>
                <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="input-luxury" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--grey-muted)' }}>Pincode</label>
                <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-luxury" placeholder="400001" />
              </div>
            </div>
          </div>
        </div>

        {/* Order review / Payment selection */}
        <div className="space-y-6">
          <div className="space-y-6 p-6 border luxury-shadow space-y-6" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
            <h2 className="text-xl font-serif border-b pb-4" style={{ color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}>Payment Method</h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition ${
                paymentMethod === 'Razorpay' ? 'border-[#D4AF37]' : 'hover:border-[#D4AF37]'
              }`}
                style={paymentMethod === 'Razorpay' ? { backgroundColor: 'rgba(212,175,55,0.05)', borderColor: '#D4AF37' } : { borderColor: 'var(--grey-mid)' }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <span className="text-sm font-semibold block" style={{ color: 'var(--fg)' }}>Pay Securely via Razorpay</span>
                    <span className="text-xxs font-light block mt-0.5" style={{ color: 'var(--grey-muted)' }}>UPI, Cards, Netbanking, Wallets</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5" style={{ color: '#D4AF37' }} />
              </label>

              {/* COD Option */}
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition`}
                style={paymentMethod === 'COD' ? { backgroundColor: 'rgba(212,175,55,0.05)', borderColor: '#D4AF37' } : { borderColor: 'var(--grey-mid)' }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <span className="text-sm font-semibold block" style={{ color: 'var(--fg)' }}>Cash on Delivery</span>
                    <span className="text-xxs font-light block mt-0.5" style={{ color: 'var(--grey-muted)' }}>Pay at your doorstep in cash</span>
                  </div>
                </div>
                <Truck className="w-5 h-5" style={{ color: '#D4AF37' }} />
              </label>
            </div>

            {/* Total summary info */}
            <div className="border-t pt-6 space-y-3 text-sm font-light" style={{ borderColor: 'var(--grey-mid)', color: 'var(--grey-muted)' }}>
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--rosegold)' }}>
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t pt-4" style={{ color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}>
                <span>Total Amount Payable</span>
                <span>₹{payableTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gold-gradient text-white text-xs uppercase tracking-wider font-semibold rounded hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Processing Order...' : paymentMethod === 'Razorpay' ? 'Pay Now & Place Order' : 'Place Order (COD)'}
            </button>
          </div>
        </div>
      </form>

      {/* Mock payment simulation modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-8 rounded-lg shadow-2xl border border-gold/30 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-playfair text-dark">Simulate Sandbox Payment</h3>
              <p className="text-xs font-light text-stone-450 mt-1">
                You are running the application in local sandbox mode with placeholder Razorpay credentials.
              </p>
            </div>
            <div className="bg-stone-100 p-4 rounded text-xs text-left space-y-2 border border-stone-200">
              <div className="flex justify-between">
                <span className="font-semibold">Order ID:</span>
                <span className="text-stone-600">{mockOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Amount:</span>
                <span className="text-gold font-bold">₹{mockAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowMockModal(false);
                  setError('Payment simulation cancelled by user.');
                }}
                className="flex-1 py-2.5 border border-stone-300 text-stone-600 text-xs uppercase font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateMockPayment}
                className="flex-1 py-2.5 gold-gradient text-white text-xs uppercase font-semibold rounded hover:opacity-90"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
