'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

const selectStyle = (value: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    Paid:      { background: 'rgba(5,150,105,0.1)',  color: '#059669', border: '1px solid rgba(5,150,105,0.3)' },
    Pending:   { background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.3)' },
    Failed:    { background: 'rgba(239,68,68,0.1)',  color: '#DC2626', border: '1px solid rgba(239,68,68,0.3)' },
    Refunded:  { background: 'rgba(139,92,246,0.1)', color: '#7C3AED', border: '1px solid rgba(139,92,246,0.3)' },
    Delivered: { background: 'rgba(5,150,105,0.1)',  color: '#059669', border: '1px solid rgba(5,150,105,0.3)' },
    Shipped:   { background: 'rgba(59,130,246,0.1)', color: '#2563EB', border: '1px solid rgba(59,130,246,0.3)' },
    Confirmed: { background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' },
    Packed:    { background: 'rgba(99,102,241,0.1)', color: '#4F46E5', border: '1px solid rgba(99,102,241,0.3)' },
    Cancelled: { background: 'rgba(239,68,68,0.1)',  color: '#DC2626', border: '1px solid rgba(239,68,68,0.3)' },
  };
  return map[value] || { background: 'var(--grey-mid)', color: 'var(--grey-muted)', border: '1px solid var(--grey-mid)' };
};

export default function AdminOrders() {
  const { token, apiBase } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateField = async (id: string, payload: object) => {
    try {
      const res = await fetch(`${apiBase}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
          Order Management
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
          Track orders, update shipping statuses, and confirm payments.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading orders…
        </div>
      ) : orders.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey-mid)', background: 'var(--pink-light)' }}>
                  {['Order & Date', 'Customer', 'Shipping Address', 'Amount', 'Payment', 'Status'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-xxs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    style={{ borderBottom: '1px solid var(--grey-mid)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="font-bold block text-xxs font-mono truncate max-w-[120px]"
                        style={{ color: 'var(--fg)' }}
                      >
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xxs mt-0.5 block" style={{ color: 'var(--grey-muted)' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-xs block" style={{ color: 'var(--fg)' }}>
                        {o.user?.name || 'Guest'}
                      </span>
                      <span className="text-xxs block" style={{ color: 'var(--grey-muted)' }}>
                        {o.user?.email || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{o.shippingAddress?.name}</p>
                      <p className="text-xxs" style={{ color: 'var(--grey-muted)' }}>
                        {o.shippingAddress?.address}, {o.shippingAddress?.city}
                      </p>
                      <p className="text-xxs font-mono" style={{ color: 'var(--grey-muted)' }}>
                        {o.shippingAddress?.pincode}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-sm" style={{ color: 'var(--fg)' }}>
                        ₹{o.payableAmount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-xxs uppercase" style={{ color: 'var(--grey-muted)' }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => updateField(o._id, { paymentStatus: e.target.value })}
                        className="text-xxs font-semibold rounded-full px-3 py-1.5 uppercase tracking-wide cursor-pointer outline-none"
                        style={{ ...selectStyle(o.paymentStatus), fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateField(o._id, { status: e.target.value })}
                        className="text-xxs font-semibold rounded-full px-3 py-1.5 uppercase tracking-wide cursor-pointer outline-none"
                        style={{ ...selectStyle(o.status), fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl"
          style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}
        >
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>No orders placed yet.</p>
        </div>
      )}
    </div>
  );
}
