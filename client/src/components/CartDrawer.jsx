import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onCheckout }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    grandTotal,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingCart size={22} color="var(--primary)" />
            <span>আপনার শপিং ব্যাগ ({cartItems.length})</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="drawer-close-btn"
            title="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                আপনার কার্ট খালি
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                প্রয়োজনীয় বাজার পণ্য কার্টে যুক্ত করুন।
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary btn-sm"
              >
                কেনাকাটা করুন
              </button>
            </div>
          ) : (
            <div>
              {/* Items List */}
              {cartItems.map((item) => {
                const itemPrice = item.discountPrice || item.regularPrice || item.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item._id || item.slug} className="drawer-item">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                      alt={item.nameBn}
                      className="drawer-item-img"
                    />
                    <div className="drawer-item-details">
                      <div className="drawer-item-title">{item.nameBn}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.35rem' }}>
                        {item.unit} • ৳{itemPrice} / ইউনিট
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Stepper */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id || item.slug, item.quantity - 1)}
                            style={{ padding: '0.2rem 0.5rem', color: '#475569' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: '0 0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id || item.slug, item.quantity + 1)}
                            style={{ padding: '0.2rem 0.5rem', color: '#475569' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="drawer-item-price">
                          ৳{itemTotal}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id || item.slug)}
                      style={{ color: '#ef4444', padding: '0.4rem' }}
                      title="আইটেম মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div style={{ marginBottom: '0.85rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#64748b' }}>
                <span>পণ্যের মূল্য (Subtotal):</span>
                <span>৳{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--danger)' }}>
                  <span>ডিসকাউন্ট:</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="drawer-subtotal-row">
              <span>সর্বমোট প্রদেয়:</span>
              <span style={{ color: 'var(--primary-dark)', fontSize: '1.35rem' }}>৳{grandTotal}</span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem' }}
            >
              <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
