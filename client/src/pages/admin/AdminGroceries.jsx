import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminGroceries({ categories, onRefreshProducts }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    category: 'চাল ও ডাল',
    categorySlug: 'rice-and-pulses',
    regularPrice: '',
    discountPrice: '',
    unit: '১ কেজি',
    stock: 50,
    image: '',
    description: '',
    isFeatured: false,
    isHot: false
  });
  const [formError, setFormError] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Computed dynamic categories combining passed categories and product categories
  const allCategories = React.useMemo(() => {
    const map = new Map();
    (categories || []).forEach(c => {
      if (c && c.slug) {
        map.set(c.slug, { slug: c.slug, nameBn: c.nameBn || c.slug, icon: c.icon || '🛍️' });
      }
    });
    (products || []).forEach(p => {
      if (p && p.categorySlug && !map.has(p.categorySlug)) {
        map.set(p.categorySlug, {
          slug: p.categorySlug,
          nameBn: p.category || p.categorySlug,
          icon: '🛍️'
        });
      }
    });
    return Array.from(map.values());
  }, [categories, products]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCat = allCategories[0] || { nameBn: 'চাল ও তেল', slug: 'rice-oil' };
    setFormData({
      nameBn: '',
      nameEn: '',
      category: defaultCat.nameBn,
      categorySlug: defaultCat.slug,
      regularPrice: '',
      discountPrice: '',
      unit: '১ কেজি',
      stock: 50,
      image: '',
      description: '',
      isFeatured: false,
      isHot: false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    const matched = allCategories.find(c => c.slug === product.categorySlug || c.nameBn === product.category);
    const initialSlug = product.categorySlug || (matched ? matched.slug : 'rice-oil');
    const initialBn = product.category || (matched ? matched.nameBn : 'চাল ও তেল');

    setFormData({
      nameBn: product.nameBn || '',
      nameEn: product.nameEn || '',
      category: initialBn,
      categorySlug: initialSlug,
      regularPrice: product.regularPrice || '',
      discountPrice: product.discountPrice || '',
      unit: product.unit || '১ পিস',
      stock: product.stock !== undefined ? product.stock : 50,
      image: product.image || '',
      description: product.description || '',
      isFeatured: Boolean(product.isFeatured),
      isHot: Boolean(product.isHot)
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nameBn.trim()) {
      setFormError('পণ্যের বাংলা নাম আবশ্যক');
      return;
    }
    if (!formData.regularPrice || Number(formData.regularPrice) <= 0) {
      setFormError('সঠিক নিয়মিত মূল্য দিন');
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchProducts();
        if (onRefreshProducts) onRefreshProducts();
      } else {
        setFormError(result.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setFormError('সার্ভার এরর');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই পণ্যটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        if (onRefreshProducts) onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter && p.category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        (p.nameBn || '').toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>মুদি পণ্য ব্যবস্থাপনা (Grocery Catalog)</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            মোট মজুদ পণ্য: <strong>{filteredProducts.length}</strong> টি
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>নতুন পণ্য যোগ করুন (Add Product)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>ক্যাটাগরি:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.88rem' }}
          >
            <option value="all">সব ক্যাটাগরি ({products.length})</option>
            {allCategories.map((c) => {
              const count = products.filter(p => p.categorySlug === c.slug || p.category === c.nameBn).length;
              return (
                <option key={c.slug} value={c.slug}>
                  {c.icon ? `${c.icon} ` : ''}{c.nameBn} {count > 0 ? `(${count})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>পণ্য তালিকা লোড হচ্ছে...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            কোনো পণ্য পাওয়া যায়নি
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ছবি</th>
                  <th>পণ্যের নাম</th>
                  <th>ক্যাটাগরি</th>
                  <th>পরিমাণ (Unit)</th>
                  <th>নিয়মিত মূল্য</th>
                  <th>অফার মূল্য</th>
                  <th>স্টক</th>
                  <th>ট্যাগ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id || p.slug}>
                    <td>
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                        alt={p.nameBn}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.nameBn}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.nameEn}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{p.unit}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem', textDecoration: p.discountPrice < p.regularPrice ? 'line-through' : 'none', color: '#64748b' }}>
                        ৳{p.regularPrice}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-dark)', fontSize: '1rem', fontFamily: 'var(--font-en)' }}>
                        ৳{p.discountPrice || p.regularPrice}
                      </strong>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: (p.stock || 0) <= 10 ? '#dc2626' : '#16a34a',
                        fontFamily: 'var(--font-en)'
                      }}>
                        {p.stock} পিস
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.isHot && <span className="badge badge-hot">হট</span>}
                        {p.isFeatured && <span className="badge badge-success">ফিচার্ড</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="btn btn-sm"
                          style={{ padding: '0.3rem 0.5rem', background: '#fee2e2', color: '#b91c1c' }}
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingProduct ? 'মুদি পণ্য সম্পাদনা (Edit Product)' : 'নতুন মুদি পণ্য যুক্ত করুন (Add Product)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                {formError && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">পণ্যের নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: তীর সয়াবিন তেল ৫ লিটার"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">পণ্যের নাম (English)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Teer Soybean Oil 5 Liter"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">ক্যাটাগরি *</label>
                    <select
                      className="form-control"
                      value={formData.categorySlug}
                      onChange={(e) => {
                        const targetSlug = e.target.value;
                        const selected = allCategories.find(c => c.slug === targetSlug);
                        setFormData({
                          ...formData,
                          categorySlug: targetSlug,
                          category: selected ? selected.nameBn : (formData.category || targetSlug)
                        });
                      }}
                    >
                      {allCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.icon ? `${c.icon} ` : ''}{c.nameBn}
                        </option>
                      ))}
                      {formData.categorySlug && !allCategories.some(c => c.slug === formData.categorySlug) && (
                        <option value={formData.categorySlug}>{formData.category || formData.categorySlug}</option>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">পরিমাপ / ইউনিট *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="যেমন: ১ কেজি, ৫ লিটার, ৫০০ গ্রাম"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">নিয়মিত মূল্য (৳) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="যেমন: 350"
                      value={formData.regularPrice}
                      onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ডিসকাউন্ট/অফার মূল্য (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="যেমন: 320"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">মজুদ স্টক (পিস)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">পণ্যের ছবির লিংক (Image URL)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">বিবরণ (Description)</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="পণ্যের গুণগত মান বা বিবরণ..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                    />
                    <span>🔥 হট অফার হিসেবে দেখান</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>⭐ ফিচার্ড পণ্য তালিকায় রাখুন</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  {editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
