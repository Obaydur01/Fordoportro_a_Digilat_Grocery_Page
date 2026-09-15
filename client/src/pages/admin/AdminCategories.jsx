import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Tags } from 'lucide-react';

export default function AdminCategories({ categories, onRefreshCategories }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    icon: '🛍️',
    image: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ nameBn: '', nameEn: '', icon: '🛍️', image: '', description: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nameBn: cat.nameBn || '',
      nameEn: cat.nameEn || '',
      icon: cat.icon || '🛍️',
      image: cat.image || '',
      description: cat.description || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nameBn.trim()) {
      setError('ক্যাটাগরির বাংলা নাম আবশ্যক');
      return;
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ nameBn: '', nameEn: '', icon: '🛍️', image: '', description: '' });
        setEditingCategory(null);
        if (onRefreshCategories) onRefreshCategories();
      } else {
        setError(data.message || (editingCategory ? 'ক্যাটাগরি আপডেট করা যায়নি' : 'ক্যাটাগরি যুক্ত করা যায়নি'));
      }
    } catch (err) {
      setError('সার্ভার এরর');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি এই ক্যাটাগরি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && onRefreshCategories) {
        onRefreshCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>ক্যাটাগরি ব্যবস্থাপনা (Category Management)</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>মোট ক্যাটাগরি: <strong>{categories.length}</strong> টি</p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>নতুন ক্যাটাগরি যোগ করুন</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {categories.map((cat) => (
          <div
            key={cat._id || cat.slug}
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {cat.icon || '🛍️'}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cat.nameBn}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {cat.nameEn || cat.slug}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => handleOpenEditModal(cat)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.5rem' }}
                title="সম্পাদনা করুন (Edit)"
              >
                <Edit2 size={14} />
              </button>

              <button
                onClick={() => handleDelete(cat._id)}
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.35rem 0.5rem' }}
                title="মুছুন (Delete)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingCategory ? 'ক্যাটাগরি সম্পাদনা (Edit Category)' : 'নতুন ক্যাটাগরি যুক্ত করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">ক্যাটাগরির নাম (বাংলা) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: ফ্রোজেন ও রেডি ফুড"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">নাম (English)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Frozen & Ready Food"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">আইকন ইমোজি (Emoji Icon)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: 🧊, 🥫, 🍞"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ছবির লিংক (Image URL)</label>
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
                    placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingCategory ? 'আপডেট করুন (Save Changes)' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
