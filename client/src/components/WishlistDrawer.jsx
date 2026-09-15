import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const { wishlist, removeFromWishlist, clearWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.slug);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(item => addToCart(item, 1));
    clearWishlist();
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setIsWishlistOpen(false)} />
      <div className="drawer-panel">
        <div className="drawer-header">
          <div className="drawer-title">
            <Heart size={22} color="#ef4444" fill="#ef4444" />
            <span>সংরক্ষিত উইশলিস্ট ({wishlist.length})</span>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="drawer-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤍</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                উইশলিস্ট খালি
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                যেকোনো পছন্দের পণ্যের হৃদস্পর্শী (❤️) আইকনে ক্লিক করে এখানে সেভ করে রাখুন।
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  পরবর্তীতে কেনার জন্য সংরক্ষিত পণ্য
                </span>
                <button
                  onClick={clearWishlist}
                  style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}
                >
                  সব মুছুন
                </button>
              </div>

              {wishlist.map((item) => {
                const price = item.discountPrice || item.regularPrice || 0;

                return (
                  <div key={item._id || item.slug} className="drawer-item">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                      alt={item.nameBn}
                      className="drawer-item-img"
                    />
                    <div className="drawer-item-details">
                      <div className="drawer-item-title">{item.nameBn}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {item.unit} • <strong style={{ color: 'var(--primary-dark)' }}>৳{price}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(item)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          <ShoppingBag size={14} />
                          <span>কার্টে নিন</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item._id || item.slug)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: '#ef4444' }}
                          title="সরান"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="drawer-footer">
            <button
              onClick={handleMoveAllToCart}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>সব আইটেম কার্টে যুক্ত করুন</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
