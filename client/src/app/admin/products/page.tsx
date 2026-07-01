'use client';

import React, { useState, useEffect } from 'react';
import { useApp, Product } from '@/context/AppContext';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

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

export default function AdminProducts() {
  const { token, apiBase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('10');
  const [selectedCat, setSelectedCat] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('Published');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token, filterCat]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${apiBase}/products?status=all`;
      if (filterCat !== 'all') url += `&category=${filterCat}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBase}/categories`);
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) { console.error(e); }
  };

  const openCreateModal = () => {
    setIsEditMode(false); setName(''); setSku(''); setDescription('');
    setPrice(''); setDiscount('0'); setStock('10');
    setSelectedCat(categories[0]?._id || ''); setTags('');
    setStatus('Published'); setSelectedFiles(null); setExistingImages([]);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setIsEditMode(true); setEditingId(p._id); setName(p.name); setSku(p.sku);
    setDescription(p.description); setPrice(p.price.toString());
    setDiscount(p.discount.toString()); setStock(p.stock.toString());
    setSelectedCat(p.category?._id || '');
    setTags(p.tags ? p.tags.join(', ') : ''); setStatus(p.status);
    setSelectedFiles(null); setExistingImages(p.images || []);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name); formData.append('sku', sku);
    formData.append('description', description); formData.append('price', price);
    formData.append('discount', discount); formData.append('stock', stock);
    formData.append('category', selectedCat);
    formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
    formData.append('status', status);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) formData.append('images', selectedFiles[i]);
    }
    if (isEditMode) formData.append('existingImages', JSON.stringify(existingImages));

    const url = isEditMode ? `${apiBase}/products/${editingId}` : `${apiBase}/products`;
    const method = isEditMode ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm('Move this product to Trash?')) return;
    try {
      const res = await fetch(`${apiBase}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) fetchProducts();
    } catch (e) { console.error(e); }
  };

  const statusColor = (s: string) => {
    if (s === 'Published') return { background: 'rgba(5,150,105,0.1)', color: '#059669' };
    if (s === 'Draft') return { background: 'rgba(245,158,11,0.1)', color: '#D97706' };
    return { background: 'var(--grey-mid)', color: 'var(--grey-muted)' };
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--fg)' }}>
            Product Management
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--grey-muted)', letterSpacing: '0.04em' }}>
            Manage items, stock levels, discounts, and specifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '0.5rem 0.85rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
            style={{ background: 'var(--fg)', color: 'var(--bg)', border: '1px solid var(--fg)', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-xs tracking-widest uppercase" style={{ color: 'var(--grey-muted)' }}>
          Loading products…
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--grey-mid)', background: 'var(--babypink)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey-mid)', background: 'var(--pink-light)' }}>
                  {['Product', 'SKU', 'Price', 'Discount', 'Stock', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-xxs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--grey-muted)', fontFamily: 'Montserrat, sans-serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--grey-muted)' }}>
                      No products found.
                    </td>
                  </tr>
                ) : products.map((p) => {
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
                            <img src={img} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt={p.name}
                              style={{ background: 'var(--grey-mid)' }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: 'var(--grey-mid)' }} />
                          )}
                          <div>
                            <span className="font-semibold text-sm block" style={{ color: 'var(--fg)' }}>{p.name}</span>
                            <span className="text-xxs" style={{ color: 'var(--grey-muted)' }}>{p.category?.name || 'Uncategorised'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--grey-muted)' }}>{p.sku}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--fg)' }}>{p.discount}%</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: p.stock < 5 ? '#DC2626' : 'var(--fg)' }}>
                        {p.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xxs font-semibold" style={statusColor(p.status)}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{ color: 'var(--grey-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--grey-mid)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--grey-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSoftDelete(p._id)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div
            className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-y-auto"
            style={{ background: 'var(--bg)', border: '1px solid var(--grey-mid)', maxHeight: '90vh' }}
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--grey-mid)' }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: 'var(--fg)' }}>
                  {isEditMode ? 'Edit Product' : 'Create Product'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--grey-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Product Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    required rows={3} value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label style={labelStyle}>Price (₹)</label>
                    <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Discount (%)</label>
                    <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock Qty</label>
                    <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} style={inputStyle}>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input
                    type="text" value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Beads, Handmade, Statement"
                    style={inputStyle}
                  />
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <label style={labelStyle}>Product Images</label>
                  <label
                    className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all duration-200"
                    style={{ border: '2px dashed var(--grey-mid)', background: 'var(--babypink)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pink-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--grey-mid)')}
                  >
                    <Upload className="w-7 h-7 mb-2" style={{ color: 'var(--grey-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--grey-muted)' }}>
                      Click to select images (multiple allowed)
                    </span>
                    <input type="file" multiple className="hidden" onChange={(e) => setSelectedFiles(e.target.files)} />
                  </label>
                  {selectedFiles && (
                    <p className="text-xs font-semibold" style={{ color: '#059669' }}>
                      {selectedFiles.length} file(s) selected
                    </p>
                  )}
                  {isEditMode && existingImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {existingImages.map((img, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden" style={{ border: '1px solid var(--grey-mid)' }}>
                          <img
                            src={img.startsWith('http') ? img : `${apiBase.replace('/api/v1', '')}${img}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: '#DC2626', fontSize: '10px' }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
                  style={{ background: 'var(--fg)', color: 'var(--bg)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  Save Product
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
