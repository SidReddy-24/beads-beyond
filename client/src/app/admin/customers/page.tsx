'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function AdminCustomers() {
  const { token, apiBase } = useApp();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCustomers(); }, [token]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/dashboard/customers`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
          Customer Database
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
          Review customer accounts, registration dates, order frequencies, and lifetime value.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading customer records…
        </div>
      ) : customers.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey-mid)', background: 'var(--pink-light)' }}>
                  {['Customer', 'Registered', 'Orders', 'Lifetime Value'].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-xxs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--grey-mid)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                          style={{ background: 'var(--pink-accent)', color: 'var(--fg)' }}
                        >
                          {c.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block" style={{ color: 'var(--fg)' }}>{c.name}</span>
                          <span className="text-xxs block" style={{ color: 'var(--grey-muted)' }}>{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--grey-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                      {c.totalOrders}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: 'var(--rosegold)' }}>
                      ₹{c.totalSpent.toLocaleString('en-IN')}
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
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>No customers found yet.</p>
        </div>
      )}
    </div>
  );
}
