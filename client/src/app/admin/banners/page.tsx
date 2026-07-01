'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Edit2, Trash2, X, Upload, ImageIcon } from 'lucide-react';

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
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--grey-muted)',
  marginBottom: '4px',
  fontFamily: 'Montserrat, sans-serif',
};

export default function AdminBanners() {
  const { token, apiBase } = useApp();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('/shop');
  const [active, setActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => { fetchBanners(); }, [token]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/banners/all`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setBanners(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false); setTitle(''); setSubtitle(''); setLink('/shop'); setActive(true); setSelectedFile(null); setShowModal(true);
  };

  const handleOpenEdit = (b: any) => {
    setIsEditMode(true); setEditingId(b._id); setTitle(b.title); setSubtitle(b.subtitle || '');
    setLink(b.link || '/shop'); setActive(b.active); setSelectedFile(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title); formData.append('subtitle', subtitle);
    formData.append('link', link); formData.append('active', active.toString());
    if (selectedFile) formData.append('image', selectedFile);
    const url = isEditMode ? `${apiBase}/banners/${editingId}` : `${apiBase}/banners`;
    try {
      const res = await fetch(url, { method: isEditMode ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchBanners(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`${apiBase}/banners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchBanners();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
            Hero Banner Management
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
            Configure premium slider images dynamically loaded on the homepage.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
          style={{ background: 'var(--fg)', color: 'var(--bg)', border: '1px solid var(--fg)', fontFamily: 'Montserrat, sans-serif' }}
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading banners…
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b) => {
            const img = b.image.startsWith('http') ? b.image : `${apiBase.replace('/api/v1', '')}${b.image}`;
            return (
              <div
                key={b._id}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}
              >
                <div className="relative h-44" style={{ background: 'var(--grey-mid)' }}>
                  <img src={img} className="w-full h-full object-cover" alt={b.title} />
                  <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xxs font-semibold uppercase tracking-wider"
                    style={b.active
                      ? { background: 'rgba(5,150,105,0.85)', color: 'white' }
                      : { background: 'rgba(0,0,0,0.5)', color: 'white' }
                    }
                  >
                    {b.active ? 'Live' : 'Inactive'}
                  </span>
                </div>
                <div className="p-5 space-y-1 flex-1">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{b.title}</h3>
                  {b.subtitle && <p className="text-xs" style={{ color: 'var(--grey-muted)' }}>{b.subtitle}</p>}
                  <p className="text-xxs font-mono" style={{ color: 'var(--grey-muted)' }}>→ {b.link}</p>
                </div>
                <div
                  className="flex justify-end gap-1 p-4"
                  style={{ borderTop: '1px solid var(--grey-mid)' }}
                >
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ color: 'var(--grey-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--grey-mid)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--grey-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ color: 'var(--grey-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--grey-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="text-center py-20 space-y-3 rounded-xl"
          style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}
        >
          <ImageIcon className="w-12 h-12 mx-auto" style={{ color: 'var(--grey-mid)' }} />
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>No banners configured. Add a banner to see it live on the homepage.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto"
            style={{ background: 'var(--bg)', border: '1px solid var(--grey-mid)', maxHeight: '90vh' }}
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--grey-mid)' }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: 'var(--fg)' }}>
                  {isEditMode ? 'Edit Banner' : 'Create Banner'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--grey-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={labelStyle}>Banner Title</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="New Collection Arrives" />
                </div>
                <div>
                  <label style={labelStyle}>Subtitle</label>
                  <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} placeholder="Handcrafted with love" />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label style={labelStyle}>Redirect Link</label>
                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} style={inputStyle} placeholder="/shop" />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox" id="bannerActive" checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      style={{ accentColor: 'var(--rosegold)', width: 16, height: 16 }}
                    />
                    <label htmlFor="bannerActive" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Active</label>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Banner Image</label>
                  <label
                    className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all duration-200"
                    style={{ border: '2px dashed var(--grey-mid)', background: 'var(--babypink)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pink-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--grey-mid)')}
                  >
                    <Upload className="w-6 h-6 mb-2" style={{ color: 'var(--grey-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--grey-muted)' }}>Click to select image</span>
                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files) setSelectedFile(e.target.files[0]); }} />
                  </label>
                  {selectedFile && (
                    <p className="text-xs font-semibold mt-1" style={{ color: '#059669' }}>{selectedFile.name}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
                  style={{ background: 'var(--fg)', color: 'var(--bg)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  Save Banner
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
