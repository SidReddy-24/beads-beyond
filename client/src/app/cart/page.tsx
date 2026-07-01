'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Trash2, Plus, Minus, ArrowRight, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, coupon, applyCoupon, removeCoupon, apiBase, token } = useApp();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!token) {
      setCouponError('Please sign in to apply coupon codes.');
      return;
    }
    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponSuccess('Coupon applied successfully!');
      setCouponCode('');
    } else {
      setCouponError('Invalid, expired, or fully used coupon code.');
    }
  };

  const handleCheckout = () => {
    if (!token) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <h2 className="text-2xl font-serif mb-4" style={{ color: 'var(--fg)' }}>Your Shopping Cart is Empty</h2>
        <p className="text-sm font-light mb-8" style={{ color: 'var(--grey-muted)' }}>Fill it with fine engagement rings, gold bands, and necklaces.</p>
        <Link href="/shop" className="btn-luxury">
          Explore Boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <h1 className="text-3xl font-serif mb-8" style={{ color: 'var(--fg)' }}>Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const product = item.product;
            const price = product.price * (1 - product.discount / 100);
            
            const imageUrl = product.images && product.images[0]
              ? product.images[0].startsWith('http')
                ? product.images[0]
                : `${apiBase.replace('/api/v1', '')}${product.images[0]}`
              : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600';

            return (
              <div key={product._id} className="flex gap-4 sm:gap-6 p-4 sm:p-6 border luxury-shadow" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--grey-light)' }}>
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold line-clamp-1" style={{ color: 'var(--fg)' }}>
                      <Link href={`/product/${product._id}`} className="hover:text-[#C88C96] transition-colors">{product.name}</Link>
                    </h3>
                    <p className="text-xxs uppercase tracking-wider mt-0.5" style={{ color: 'var(--grey-muted)' }}>{product.category?.name || 'Jewelry'}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    {/* Qty Selector */}
                    <div className="flex items-center border" style={{ borderColor: 'var(--grey-mid)' }}>
                      <button
                        onClick={() => updateCartQty(product._id, Math.max(item.quantity - 1, 1))}
                        className="p-1 hover:text-[#C88C96] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(product._id, Math.min(item.quantity + 1, product.stock))}
                        className="p-1 hover:text-[#C88C96] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Price */}
                      <span className="text-sm sm:text-base font-semibold" style={{ color: 'var(--fg)' }}>
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="hover:text-red-500 transition-colors"
                        style={{ color: 'var(--grey-muted)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-6">
          <div className="p-6 border luxury-shadow space-y-6" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
            <h3 className="text-lg font-serif border-b pb-4" style={{ color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}>Order Summary</h3>

            {/* Coupon Code Block */}
            <div className="space-y-3">
              {coupon ? (
                <div className="bg-gold/10 border border-gold/30 rounded p-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold fill-gold" />
                    <span className="font-semibold text-gold">{coupon.code} Applied</span>
                    <span className="text-stone-500 font-light">
                      ({coupon.discountType === 'Percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off)
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-stone-450 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs border border-stone-200 rounded px-3 py-2.5 focus:outline-none uppercase"
                  />
                  <button type="submit" className="px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-white text-xs uppercase tracking-wider font-semibold transition">
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-xxs text-red-500">{couponError}</p>}
              {couponSuccess && <p className="text-xxs text-emerald-600">{couponSuccess}</p>}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm font-light" style={{ color: 'var(--grey-muted)' }}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--rosegold)' }}>
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold text-base" style={{ color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}>
                <span>Estimated Total</span>
                <span>₹{payableTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full text-center py-4 gold-gradient text-white text-xs uppercase tracking-wider font-semibold rounded hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
