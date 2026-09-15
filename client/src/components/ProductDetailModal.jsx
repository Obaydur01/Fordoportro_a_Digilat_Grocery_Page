import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Plus, Minus, Check, Truck, ShieldCheck, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const productId = product._id || product.slug;
  const isWish = isInWishlist(productId);

  const regular = Number(product.regularPrice) || 0;
  const current = Number(product.discountPrice) || regular;
  const hasDiscount = regular > current;
  const discountPercent = hasDiscount ? Math.round(((regular - current) / regular) * 100) : 0;
  const savings = hasDiscount ? (regular - current) * quantity : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  const productWaLink = `https://wa.me/8801327226437?text=${encodeURIComponent(
    `হ্যালো ফর্দপত্র, আমি "${product.nameBn}" (${product.unit}) সম্পর্কে বিস্তারিত জানতে চাই।`
  )}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {product.category}
          </span>
          <button onClick={onClose} className="drawer-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Product Image */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#f8fafc',
              border: '1px solid var(--border)'
            }}>
              <img
                src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                alt={product.nameBn}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {hasDiscount && (
              <span className="badge badge-discount" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                -{discountPercent}% ছাড়
              </span>
            )}
          </div>

          {/* Right: Product Specs */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '0.35rem' }}>
              {product.nameBn}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
              {product.nameEn}
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-en)' }}>
                  ৳{current}
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through', fontFamily: 'var(--font-en)' }}>
                    ৳{regular}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                পরিমাণ: <strong>{product.unit || '১ পিস'}</strong>
                {savings > 0 && (
                  <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 700 }}>
                    (সাশ্রয় ৳{savings})
                  </span>
                )}
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {product.description || '১০০% খাঁটি ও তাজা মুদি পণ্য। দ্রুততম হোম ডেলিভারির নিশ্চয়তা।'}
            </p>

            {/* Quantity Stepper & Add */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '0.2rem' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.4rem 0.7rem', color: '#334155' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ padding: '0 0.8rem', fontWeight: 800, fontSize: '1rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '0.4rem 0.7rem', color: '#334155' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {addedAnimation ? (
                  <>
                    <Check size={18} />
                    <span>কার্টে যোগ হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>কার্টে নিন (৳{current * quantity})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`btn btn-secondary ${isWish ? 'active' : ''}`}
                style={{ padding: '0.75rem', color: isWish ? '#ef4444' : '#64748b' }}
                title="উইশলিস্ট"
              >
                <Heart size={20} fill={isWish ? '#ef4444' : 'none'} />
              </button>
            </div>

            {/* Direct WhatsApp ask button */}
            <a
              href={productWaLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp btn-sm"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              <MessageSquare size={16} />
              <span>হোয়াটসঅ্যাপে প্রশ্ন করুন (01327226437)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
