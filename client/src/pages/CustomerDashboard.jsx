import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Package,
  ShoppingBag,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function CustomerDashboard({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'wishlist'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders specifically for this authenticated customer
  useEffect(() => {
    if (!currentUser?.uid && !currentUser?.email) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const params = new URLSearchParams();
    if (currentUser.uid) params.append('userId', currentUser.uid);
    if (currentUser.email) params.append('customerEmail', currentUser.email);

    fetch(`/api/orders?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
        setLoadingOrders(false);
      })
      .catch(() => {
        setOrders([]);
        setLoadingOrders(false);
      });
  }, [currentUser?.uid, currentUser?.email]);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.slug);
    setIsCartOpen(true);
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Processing': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  return (
    <div className="fp-container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      {/* Profile Header */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {currentUser?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentUser?.displayName || 'সম্মানিত গ্রাহক'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              {currentUser?.email || 'customer@fordoportro.com'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('shop')}
            className="btn btn-secondary btn-sm"
          >
            <ShoppingBag size={16} />
            <span>বাজার করুন</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="btn btn-sm"
            style={{ background: '#fee2e2', color: '#b91c1c' }}
          >
            <LogOut size={16} />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'orders' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'orders' ? 'var(--primary-dark)' : '#64748b'
          }}
        >
          <Package size={18} />
          <span>আমার অর্ডারসমূহ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: activeTab === 'wishlist' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'wishlist' ? 'var(--primary-dark)' : '#64748b'
          }}
        >
          <Heart size={18} color="#ef4444" fill={activeTab === 'wishlist' ? '#ef4444' : 'none'} />
          <span>সংরক্ষিত উইশলিস্ট ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders View */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>অর্ডার লোড হচ্ছে...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="empty-icon">📦</div>
              <h3>এখনও কোনো অর্ডার করেননি!</h3>
              <p style={{ margin: '0.5rem 0 1.5rem' }}>কম দামে টাটকা গ্রোসারি সামগ্রী অর্ডার করুন।</p>
              <button onClick={() => onNavigate('shop')} className="btn btn-primary">
                বাজার শুরু করুন
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => {
                const currentStep = getStatusStep(order.status);

                return (
                  <div
                    key={order._id || order.orderNumber}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>অর্ডার নম্বর:</span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-en)' }}>
                          #{order.orderNumber}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {new Date(order.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'long' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${order.status === 'Delivered' ? 'badge-success' :
                            order.status === 'Cancelled' ? 'badge-discount' : 'badge-warning'
                          }`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                          {order.status || 'Pending'}
                        </span>

                        <a
                          href={`https://wa.me/8801327226437?text=হ্যালো,%20আমি%20অর্ডার%20%23${order.orderNumber}%20সম্পর্কে%20জানতে%20চাই`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-whatsapp btn-sm"
                        >
                          <MessageSquare size={14} />
                          <span>হোয়াটসঅ্যাপে আপডেট</span>
                        </a>
                      </div>
                    </div>

                    {/* Order Tracking Timeline Bar */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '1rem',
                      margin: '1rem 0'
                    }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                        লাইভ ডেলিভারি স্ট্যাটাস:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '5%',
                          right: '5%',
                          height: '4px',
                          background: '#e2e8f0',
                          zIndex: 1
                        }}>
                          <div style={{
                            height: '100%',
                            background: 'var(--primary)',
                            width: `${((currentStep - 1) / 4) * 100}%`,
                            transition: 'width 0.4s ease'
                          }} />
                        </div>

                        {['অর্ডার গৃহীত', 'কনফার্মড', 'প্যাকিং', 'অন দ্য ওয়ে', 'ডেলিভার্ড'].map((stepName, sIdx) => {
                          const isDone = (sIdx + 1) <= currentStep;
                          return (
                            <div key={sIdx} style={{ zIndex: 2, textAlign: 'center', width: '70px' }}>
                              <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: isDone ? 'var(--primary)' : 'white',
                                color: isDone ? 'white' : '#94a3b8',
                                border: isDone ? 'none' : '2px solid #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 4px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <div style={{ fontSize: '0.72rem', fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--primary-dark)' : '#64748b' }}>
                                {stepName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items Mini Row */}
                    <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                      <strong>পণ্যসমূহ:</strong> {order.items?.map(it => `${it.name} (${it.quantity})`).join(', ')}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.05rem' }}>
                      সর্বমোট বিল: ৳{order.grandTotal} ({order.paymentMethod})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer Wishlist View */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="empty-icon">🤍</div>
              <h3>আপনার উইশলিস্টে কোনো পণ্য নেই!</h3>
              <p style={{ margin: '0.5rem 0 1.5rem' }}>পছন্দের পণ্যে ❤️ আইকন ক্লিক করে এখানে সংরক্ষণ করুন।</p>
              <button onClick={() => onNavigate('shop')} className="btn btn-primary">
                পণ্য ব্রাউজ করুন
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {wishlist.map((product) => (
                <div
                  key={product._id || product.slug}
                  className="product-card"
                >
                  <div className="product-img-wrapper">
                    <img
                      src={product.image}
                      alt={product.nameBn}
                      className="product-img"
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id || product.slug)}
                      className="wishlist-heart-btn active"
                      title="উইশলিস্ট থেকে মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="product-info">
                    <div>
                      <div className="product-title">{product.nameBn}</div>
                      <div className="product-unit">{product.unit}</div>
                      <div className="price-current">
                        ৳{product.discountPrice || product.regularPrice}
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.88rem' }}
                      >
                        <ShoppingBag size={16} />
                        <span>কার্টে যোগ করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
