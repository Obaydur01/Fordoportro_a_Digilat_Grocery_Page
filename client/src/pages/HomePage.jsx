import React from 'react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Flame, Sparkles, Award } from 'lucide-react';

export default function HomePage({ products, categories, onNavigate, onSelectProduct }) {
  // Filter sections dynamically
  const hotOffers = products.filter(p => p.isHot || (p.regularPrice > p.discountPrice)).slice(0, 8);
  const latestProducts = products.slice(0, 8);

  // Group products by dynamic categories that have items in the database
  const dynamicCategorySections = categories.map(cat => {
    const catProducts = products.filter(p =>
      p.categorySlug === cat.slug ||
      p.category === cat.nameBn ||
      p.category === cat.nameEn
    );
    return { ...cat, products: catProducts };
  }).filter(cat => cat.products.length > 0);

  return (
    <div>
      {/* Hero Banner Carousel & Perks */}
      <HeroBanner onExplore={() => onNavigate('shop')} />

      <div className="fp-container" style={{ paddingBottom: '3rem' }}>
        {/* Featured Categories Grid */}
        <section style={{ margin: '1rem 0 3rem' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>ক্যাটাগরি সমূহ</span> (Departments)
            </h2>
            <button
              onClick={() => onNavigate('shop')}
              style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>সব দেখুন</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat._id || cat.slug}
                className="category-card"
                onClick={() => onNavigate('shop', { selectedCategory: cat.slug })}
              >
                <div className="category-icon-wrapper">
                  {cat.icon || '🛍️'}
                </div>
                <div className="category-name">{cat.nameBn}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: Today's Best Offers (আজকের সেরা অফার) */}
        {hotOffers.length > 0 && (
          <section style={{ marginBottom: '3.5rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <Flame size={26} color="#ef4444" />
                <span>আজকের সেরা অফার</span> (Today's Best Deals)
              </h2>
              <button
                onClick={() => onNavigate('shop', { selectedCategory: 'todays-best-offer' })}
                className="btn btn-secondary btn-sm"
              >
                <span>সকল অফার দেখুন</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="products-grid">
              {hotOffers.map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Fresh Groceries & Essentials (সকল তাজা মুদি ও খাদ্যপণ্য) */}
        {latestProducts.length > 0 && (
          <section style={{ marginBottom: '3.5rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <Sparkles size={24} color="#10b981" />
                <span>তাজা মুদি ও খাদ্যসামগ্রী</span> (Fresh Groceries & Essentials)
              </h2>
              <button
                onClick={() => onNavigate('shop')}
                style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>সব পণ্য দেখুন</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="products-grid">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Category Sections from MongoDB Atlas */}
        {dynamicCategorySections.map((catSection) => (
          <section key={catSection._id || catSection.slug} style={{ marginBottom: '3.5rem' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span>{catSection.icon || '🛍️'} {catSection.nameBn}</span> {catSection.nameEn ? `(${catSection.nameEn})` : ''}
              </h2>
              <button
                onClick={() => onNavigate('shop', { selectedCategory: catSection.slug })}
                style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>আরও দেখুন</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="products-grid">
              {catSection.products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </section>
        ))}

        {/* WhatsApp Hotline Callout Strip */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          borderRadius: '16px',
          padding: '2.5rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fef08a', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Sparkles size={18} />
              <span>সরাসরি পাইকারি বাজার</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              ফোন বা হোয়াটসঅ্যাপে বাজারের ফর্দ পাঠাতে চান?
            </h3>
            <p style={{ opacity: 0.9, maxWidth: '520px', fontSize: '0.95rem' }}>
              আমাদের অফিশিয়াল হোয়াটসঅ্যাপ বিজনেস নম্বর <strong>01327226437</strong> এ আপনার বাজারের ফর্দ লিখে বা ছবি তুলে পাঠিয়ে দিন। আমাদের প্রতিনিধি দ্রুত আপনার অর্ডার প্রস্তুত করে দেবে!
            </p>
          </div>

          <a
            href="https://wa.me/8801327226437?text=হ্যালো,%20আমি%20ফর্দপত্র%20থেকে%20বাজারের%20লিস্ট%20দিতে%20চাই।"
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}
          >
            <span>হোয়াটসঅ্যাপ চ্যাট শুরু করুন</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
