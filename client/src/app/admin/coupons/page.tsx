'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Edit2, Trash2, X, Ticket } from 'lucide-react';

// Reusable themed input/label styles
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--grey-mid)',
  color: 'var(--fg)',
  padding: '0.6rem 0.85rem',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.8rem',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--grey-muted)',
  marginBottom: '4px',
  fontFamily: 'Montserrat, sans-serif',
};

export default function AdminCoupons() {
  const { token, apiBase } = useApp();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [active, setActive] = useState(true);

  useEffect(() => { fetchCoupons(); }, [token]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setCoupons(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false); setCode(''); setDiscountType('Percentage');
    setDiscountValue(''); setExpiryDate(''); setUsageLimit('100');
    setActive(true); setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setIsEditMode(true); setEditingId(c._id); setCode(c.code);
    setDiscountType(c.discountType); setDiscountValue(c.discountValue.toString());
    setExpiryDate(new Date(c.expiryDate).toISOString().substring(0, 10));
    setUsageLimit(c.usageLimit.toString()); setActive(c.active); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code, discountType, discountValue: Number(discountValue), expiryDate, usageLimit: Number(usageLimit), active };
    const url = isEditMode ? `${apiBase}/coupons/${editingId}` : `${apiBase}/coupons`;
    const method = isEditMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchCoupons(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${apiBase}/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchCoupons();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
            Coupon Management
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
            Configure discount codes, percentages, flat prices, and expiry calendars.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
          style={{
            background: 'var(--fg)',
            color: 'var(--bg)',
            border: '1px solid var(--fg)',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading coupons…
        </div>
      ) : coupons.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey-mid)', background: 'var(--pink-light)' }}>
                  {['Coupon Code', 'Type', 'Value', 'Expiry', 'Usage', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-xxs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr
                    key={c._id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--grey-mid)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pink-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 font-bold flex items-center gap-2" style={{ color: 'var(--rosegold)' }}>
                      <Ticket className="w-4 h-4" /> {c.code}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--fg)' }}>{c.discountType}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--fg)' }}>
                      {c.discountType === 'Percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--grey-muted)' }}>
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--fg)' }}>
                      {c.usedCount} / {c.usageLimit}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xxs font-semibold"
                        style={
                          c.active && new Date(c.expiryDate) >= new Date()
                            ? { background: 'rgba(5,150,105,0.1)', color: '#059669' }
                            : { background: 'rgba(239,68,68,0.1)', color: '#DC2626' }
                        }
                      >
                        {c.active && new Date(c.expiryDate) >= new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ color: 'var(--grey-muted)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--grey-mid)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--grey-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ color: 'var(--grey-muted)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--grey-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>No coupons found. Create your first coupon above.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--grey-mid)' }}
          >
            <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--grey-mid)' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: 'var(--fg)' }}>
                {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--grey-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={labelStyle}>Coupon Code</label>
                <input
                  type="text" required value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SUMMER20"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{ ...inputStyle }}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Price (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Value</label>
                  <input
                    type="number" required value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input
                    type="date" required value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Usage Limit</label>
                  <input
                    type="number" required value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox" id="active-coupon" checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ accentColor: 'var(--rosegold)', width: 16, height: 16 }}
                />
                <label htmlFor="active-coupon" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                  Active
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
                style={{ background: 'var(--fg)', color: 'var(--bg)', fontFamily: 'Montserrat, sans-serif' }}
              >
                Save Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
