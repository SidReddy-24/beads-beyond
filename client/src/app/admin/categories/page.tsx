'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Edit2, Trash2, X, FolderTree } from 'lucide-react';

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
  textTransform: 'uppercase',
  color: 'var(--grey-muted)',
  marginBottom: '4px',
  fontFamily: 'Montserrat, sans-serif',
};

export default function AdminCategories() {
  const { token, apiBase } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => { fetchCategories(); }, [token]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/categories`);
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false); setName(''); setDescription(''); setImage(''); setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setIsEditMode(true); setEditingId(c._id); setName(c.name);
    setDescription(c.description || ''); setImage(c.image || ''); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description, image };
    const url = isEditMode ? `${apiBase}/categories/${editingId}` : `${apiBase}/categories`;
    const method = isEditMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchCategories(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${apiBase}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchCategories();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
            Category Management
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
            Manage product classification structures.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
          style={{ background: 'var(--fg)', color: 'var(--bg)', border: '1px solid var(--fg)', fontFamily: 'Montserrat, sans-serif' }}
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading categories…
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c._id}
              className="flex flex-col justify-between space-y-4 p-5 rounded-xl transition-all duration-200"
              style={{ background: 'var(--babypink)', border: '1px solid var(--grey-mid)' }}
            >
              <div className="flex items-center gap-3">
                {c.image ? (
                  <img src={c.image} className="w-12 h-12 object-cover rounded-full flex-shrink-0" alt={c.name} style={{ background: 'var(--grey-mid)' }} />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--grey-mid)' }}
                  >
                    <FolderTree className="w-5 h-5" style={{ color: 'var(--grey-muted)' }} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{c.name}</h3>
                  <p className="text-xxs font-mono mt-0.5" style={{ color: 'var(--grey-muted)' }}>slug: {c.slug}</p>
                </div>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--grey-muted)' }}>
                {c.description || 'No description provided.'}
              </p>
              <div className="flex justify-end gap-1 pt-3" style={{ borderTop: '1px solid var(--grey-mid)' }}>
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
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl"
          style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}
        >
          <p className="text-sm" style={{ color: 'var(--grey-muted)' }}>No categories found. Add your first category above.</p>
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
                {isEditMode ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--grey-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={labelStyle}>Category Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input
                  type="text" value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/uploads/products/earrings.jpg"
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
                style={{ background: 'var(--fg)', color: 'var(--bg)', fontFamily: 'Montserrat, sans-serif' }}
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
