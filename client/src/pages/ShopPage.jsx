import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, Search, X, SlidersHorizontal } from 'lucide-react';

export default function ShopPage({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  onSelectProduct
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(2500);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category match
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'todays-best-offer') {
          if (!p.isHot && !(p.regularPrice > p.discountPrice)) return false;
        } else if (p.categorySlug !== selectedCategory && p.category !== selectedCategory) {
          return false;
        }
      }

      // Search match
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBn = (p.nameBn || '').toLowerCase().includes(q);
        const matchEn = (p.nameEn || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchBn && !matchEn && !matchCat) return false;
      }

      // Price filter
      const price = p.discountPrice || p.regularPrice || 0;
      if (price > priceRange) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.regularPrice || 0;
      const priceB = b.discountPrice || b.regularPrice || 0;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const discA = (a.regularPrice || 0) - priceA;
        const discB = (b.regularPrice || 0) - priceB;
        return discB - discA;
      }
      return 0; // default
    });
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  return (
    <div className="fp-container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {selectedCategory === 'all' || !selectedCategory ? 'সমস্ত মুদি পণ্য' :
             selectedCategory === 'todays-best-offer' ? 'আজকের সেরা অফার' :
             categories.find(c => c.slug === selectedCategory)?.nameBn || 'মুদি পণ্য'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            মোট <strong>{filteredProducts.length}</strong> টি পণ্য পাওয়া গেছে
          </p>
        </div>

        {/* Sort & Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {searchQuery && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f1f5f9',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.85rem'
            }}>
              <span>খোঁজা হচ্ছে: "<strong>{searchQuery}</strong>"</span>
              <button onClick={() => setSearchQuery('')} style={{ color: '#64748b' }}>
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.88rem' }}
            >
              <option value="featured">ফিচার্ড পণ্য</option>
              <option value="price-asc">দাম: কম থেকে বেশি (৳)</option>
              <option value="price-desc">দাম: বেশি থেকে কম (৳)</option>
              <option value="discount">সর্বোচ্চ ডিসকাউন্ট</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Category Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        {/* Left Sidebar */}
        <aside style={{ display: 'none', '@media (min-width: 900px)': { display: 'block' } }}>
          <div style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--primary)" />
              <span>ক্যাটাগরি সমূহ</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.75rem' }}>
              <button
                onClick={() => onSelectCategory('all')}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: selectedCategory === 'all' ? 700 : 500,
                  background: selectedCategory === 'all' ? 'var(--primary-light)' : 'transparent',
                  color: selectedCategory === 'all' ? 'var(--primary-dark)' : 'var(--text-main)'
                }}
              >
                ✨ সব পণ্য (All)
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: selectedCategory === cat.slug ? 700 : 500,
                    background: selectedCategory === cat.slug ? 'var(--primary-light)' : 'transparent',
                    color: selectedCategory === cat.slug ? 'var(--primary-dark)' : 'var(--text-main)'
                  }}
                >
                  {cat.icon || '🛍️'} {cat.nameBn}
                </button>
              ))}
            </div>

            {/* Price Filter Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <span>সর্বোচ্চ মূল্য:</span>
                <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>৳{priceRange}</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main>
          {filteredProducts.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="empty-icon">🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                কোনো পণ্য খুঁজে পাওয়া যায়নি
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                অনুগ্রহ করে অন্য কোনো নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
              </p>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setSearchQuery('');
                  setPriceRange(2500);
                }}
                className="btn btn-primary btn-sm"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
