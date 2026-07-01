'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { RefreshCw, Trash, Archive } from 'lucide-react';

export default function AdminTrash() {
  const { token, apiBase } = useApp();
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrash(); }, [token]);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products/trash`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setDeletedProducts(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/products/${id}/restore`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchTrash();
    } catch (e) { console.error(e); }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('WARNING: Permanent delete is irreversible. Continue?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchTrash();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
          Trash Bin
        </h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
          Review soft-deleted items. Restore returns them to the main catalog.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading trash bin…
        </div>
      ) : deletedProducts.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey-mid)', background: 'var(--pink-light)' }}>
                  {['Product', 'SKU', 'Price', 'Deleted At', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-xxs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deletedProducts.map((p) => {
                  const img = p.images && p.images[0]
                    ? p.images[0].startsWith('http') ? p.images[0] : `${apiBase.replace('/api/v1', '')}${p.images[0]}`
                    : '';
                  return (
                    <tr
                      key={p._id}
                      style={{ borderBottom: '1px solid var(--grey-mid)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 opacity-60" alt={p.name} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0 opacity-40" style={{ background: 'var(--grey-mid)' }} />
                          )}
                          <div>
                            <span className="font-semibold text-sm block opacity-70" style={{ color: 'var(--fg)' }}>{p.name}</span>
                            <span className="text-xxs" style={{ color: 'var(--grey-muted)' }}>{p.category?.name || 'Uncategorised'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--grey-muted)' }}>{p.sku}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--grey-muted)' }}>
                        {p.deletedAt ? new Date(p.deletedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(p._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-semibold uppercase tracking-wider transition-all duration-200"
                            style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(5,150,105,0.2)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(5,150,105,0.1)'; }}
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(p._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-semibold uppercase tracking-wider transition-all duration-200"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                          >
                            <Trash className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="text-center py-20 rounded-xl space-y-3"
          style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}
        >
          <Archive className="w-12 h-12 mx-auto" style={{ color: 'var(--grey-mid)' }} />
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>Trash bin is empty.</p>
        </div>
      )}
    </div>
  );
}
