'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Heart, Package, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function AccountOrdersContent() {
  const { token, apiBase, user, wishlist, toggleWishlist } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  
  // Set default tab based on query param if available
  const initialTab = (searchParams.get('tab') as 'orders' | 'wishlist' | 'addresses') || 'orders';
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>(initialTab);
  const [loading, setLoading] = useState(true);

  const showSuccessBanner = searchParams.get('success') === 'true';

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const tabParam = searchParams.get('tab') as 'orders' | 'wishlist' | 'addresses';
    if (tabParam && ['orders', 'wishlist', 'addresses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, token, router]);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${apiBase}/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setOrders(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlistItems = async () => {
      try {
        const res = await fetch(`${apiBase}/wishlists`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setWishlistProducts(json.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchOrders();
    fetchWishlistItems();
  }, [token, wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      
      {showSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-lg mb-8 flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg font-playfair">Order Placed Successfully!</h3>
            <p className="text-sm font-light mt-0.5">Thank you for your purchase. We are preparing your fine jewelry items.</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif" style={{ color: 'var(--fg)' }}>My Account</h1>
        <p className="text-sm font-light mt-1" style={{ color: 'var(--grey-muted)' }}>Hello, {user?.name}. Manage your orders, wishlist, and shipping addresses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 transition ${
              activeTab === 'orders' ? 'gold-gradient shadow-md' : 'hover:opacity-80 border'
            }`}
            style={activeTab === 'orders' ? {} : { backgroundColor: 'var(--bg)', color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}
          >
            <Package className="w-4 h-4" />
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 transition ${
              activeTab === 'wishlist' ? 'gold-gradient shadow-md' : 'hover:opacity-80 border'
            }`}
            style={activeTab === 'wishlist' ? {} : { backgroundColor: 'var(--bg)', color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}
          >
            <Heart className="w-4 h-4" />
            My Wishlist ({wishlistProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 transition ${
              activeTab === 'addresses' ? 'gold-gradient shadow-md' : 'hover:opacity-80 border'
            }`}
            style={activeTab === 'addresses' ? {} : { backgroundColor: 'var(--bg)', color: 'var(--fg)', borderColor: 'var(--grey-mid)' }}
          >
            <MapPin className="w-4 h-4" />
            Saved Addresses
          </button>
        </aside>

        {/* Tab Contents */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-playfair text-dark mb-4">Your Orders</h2>
              {loading ? (
                <div className="animate-pulse border h-40" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }} />
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border luxury-shadow p-6 space-y-4" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--grey-mid)' }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-ivory gap-2">
                        <div>
                          <p className="text-xs text-stone-400 font-light">Order ID: <span className="font-semibold text-dark">{order._id}</span></p>
                          <p className="text-xs text-stone-400 font-light mt-0.5">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2.5 py-1 text-xxs font-semibold uppercase tracking-wider ${
                            order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          <span className={`px-2.5 py-1 text-xxs font-semibold uppercase tracking-wider ${
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : ''
                          }`}
                            style={order.status !== 'Delivered' ? { backgroundColor: 'rgba(212,175,55,0.12)', color: '#D4AF37' } : {}}
                          >
                            Status: {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => {
                          const imageUrl = item.image
                            ? item.image.startsWith('http')
                              ? item.image
                              : `${apiBase.replace('/api/v1', '')}${item.image}`
                            : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300';
                          return (
                            <div key={idx} className="flex gap-4 items-center">
                              <img src={imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded bg-stone-100" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-dark truncate">{item.name}</h4>
                                <p className="text-xxs text-stone-400 font-light">Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t flex justify-between items-center text-sm" style={{ borderColor: 'var(--grey-mid)' }}>
                        <span className="font-light" style={{ color: 'var(--grey-muted)' }}>Total Paid</span>
                        <span className="font-semibold" style={{ color: 'var(--fg)' }}>₹{order.payableAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-ivory rounded">
                  <p className="text-stone-400 text-sm font-light">No orders placed yet.</p>
                  <Link href="/shop" className="mt-4 inline-block text-xs uppercase tracking-wider font-semibold text-gold underline">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-playfair text-dark mb-4">My Wishlist</h2>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistProducts.map((p) => {
                    const imageUrl = p.images && p.images[0]
                      ? p.images[0].startsWith('http')
                        ? p.images[0]
                        : `${apiBase.replace('/api/v1', '')}${p.images[0]}`
                      : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300';
                    return (
                      <div key={p._id} className="flex gap-4 bg-white p-4 border border-ivory rounded luxury-shadow">
                        <img src={imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded bg-stone-100" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-dark truncate">
                              <Link href={`/product/${p._id}`}>{p.name}</Link>
                            </h4>
                            <p className="text-xs text-gold font-semibold mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                          </div>
                          <button
                            onClick={() => toggleWishlist(p._id)}
                            className="text-xxs uppercase tracking-wider text-red-500 font-semibold text-left self-start mt-2 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white border border-ivory rounded">
                  <p className="text-stone-400 text-sm font-light">Your wishlist is empty.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-playfair text-dark mb-4">Saved Shipping Addresses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user?.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded border border-ivory luxury-shadow space-y-2">
                      <h4 className="font-semibold text-sm text-dark">{addr.name} {addr.isDefault && <span className="text-xxs font-semibold bg-gold/15 text-gold px-1.5 py-0.5 rounded ml-2">Default</span>}</h4>
                      <p className="text-xs font-light text-stone-600">{addr.address}</p>
                      <p className="text-xs font-light text-stone-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-xs font-light text-stone-600">Phone: {addr.phone}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded border border-ivory luxury-shadow col-span-2 text-center text-stone-400 font-light text-sm">
                    No saved addresses found. Addresses are automatically saved on checkout.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function AccountOrders() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-semibold">Loading account panel...</div>}>
      <AccountOrdersContent />
    </Suspense>
  );
}

