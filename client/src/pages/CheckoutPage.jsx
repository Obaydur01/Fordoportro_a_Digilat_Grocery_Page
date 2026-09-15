import React, { useState } from 'react';
import { ShoppingBag, Truck, CreditCard, ArrowRight, ShieldCheck, PhoneCall, AlertCircle, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage({ onOrderSuccess, onBackToShop }) {
  const {
    cartItems,
    subtotal,
    deliveryFee,
    deliveryZone,
    setDeliveryZone,
    discountAmount,
    grandTotal,
    clearCart
  } = useCart();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState(() => {
    const key = currentUser?.uid ? `fp_checkout_form_${currentUser.uid}` : 'fp_checkout_form_guest';
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || currentUser?.displayName || '',
          phone: parsed.phone || '',
          email: parsed.email || currentUser?.email || '',
          city: parsed.city || 'ঢাকা',
          address: parsed.address || '',
          deliveryNote: parsed.deliveryNote || '',
          paymentMethod: parsed.paymentMethod || 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
        };
      }
    } catch (e) { }
    return {
      name: currentUser?.displayName || '',
      phone: '',
      email: currentUser?.email || '',
      city: 'ঢাকা',
      address: '',
      deliveryNote: '',
      paymentMethod: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
    };
  });

  // Persist form inputs across page reloads for current customer
  React.useEffect(() => {
    const key = currentUser?.uid ? `fp_checkout_form_${currentUser.uid}` : 'fp_checkout_form_guest';
    try {
      localStorage.setItem(key, JSON.stringify(formData));
    } catch (e) { }
  }, [formData, currentUser?.uid]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="fp-container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>আপনার শপিং ব্যাগ খালি!</h2>
          <p style={{ margin: '1rem 0 1.5rem' }}>অর্ডার করার পূর্বে অনুগ্রহ করে কিছু পণ্য কার্টে যুক্ত করুন।</p>
          <button onClick={onBackToShop} className="btn btn-primary">
            কেনাকাটা শুরু করুন
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMessage('একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 017xxxxxxxx)');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: (formData.email || currentUser?.email || '').trim().toLowerCase() || null,
        shippingAddress: formData.address.trim(),
        city: formData.city,
        deliveryArea: deliveryZone,
        deliveryNote: formData.deliveryNote.trim(),
        items: cartItems.map(item => ({
          productId: item._id || item.legacyId || item.slug,
          name: item.nameBn || item.name || 'পণ্য',
          nameEn: item.nameEn || '',
          price: item.discountPrice || item.price || item.regularPrice || 0,
          regularPrice: item.regularPrice || 0,
          unit: item.unit || '১ পিস',
          quantity: item.quantity || 1
        })),
        subtotal,
        deliveryFee,
        discountAmount,
        grandTotal,
        paymentMethod: formData.paymentMethod,
        userId: currentUser?.uid || null
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = { success: false, message: 'সার্ভার থেকে অপ্রত্যাশিত প্রতিক্রিয়া এসেছে।' };
      }

      if (response.ok && data.success && data.order) {
        clearCart();
        try { localStorage.removeItem('fp_checkout_form'); } catch (e) { }
        onOrderSuccess(data.order, data.whatsapp);
      } else {
        setErrorMessage(data.message || `অর্ডার ব্যর্থ হয়েছে (${response.status})। অনুগ্রহ করে আবার চেষ্টা করুন।`);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fp-container">
      <div style={{ padding: '2rem 0 1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>অর্ডার কনফার্মেশন ও চেকআউট</h1>
        <p style={{ color: '#64748b' }}>সরাসরি পাইকারি বাজার Fordoportro থেকে আপনার দরজায়</p>
      </div>

      {errorMessage && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="checkout-grid">
        {/* Left Column: Customer & Delivery Info */}
        <div>
          <div className="checkout-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="checkout-title">
              <Truck size={20} color="var(--primary)" />
              <span>ডেলিভারি তথ্য (Delivery Information)</span>
            </h2>

            <div className="form-group">
              <label className="form-label">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                className="form-control"
                placeholder="যেমন: মোঃ জাহিদ হাসান"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">মোবাইল নম্বর (সচল) *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="যেমন: 01711223344"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ইমেইল (ঐচ্ছিক)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ডেলিভারি এরিয়া *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  className={`payment-option-card ${deliveryZone === 'inside-dhaka' ? 'selected' : ''}`}
                  onClick={() => setDeliveryZone('inside-dhaka')}
                >
                  <input
                    type="radio"
                    checked={deliveryZone === 'inside-dhaka'}
                    onChange={() => setDeliveryZone('inside-dhaka')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>ঢাকা মিরপুরের ভেতরে</div>
                  </div>
                </div>

                <div
                  className={`payment-option-card ${deliveryZone === 'outside-dhaka' ? 'selected' : ''}`}
                  onClick={() => setDeliveryZone('outside-dhaka')}
                >
                  <input
                    type="radio"
                    checked={deliveryZone === 'outside-dhaka'}
                    onChange={() => setDeliveryZone('outside-dhaka')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>ঢাকা মিরপুরের বাইরে</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">পূর্ণ ডেলিভারি ঠিকানা (বাসা নং, রোড, এলাকা) *</label>
              <textarea
                rows="3"
                className="form-control"
                placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ব্লক ডি, মিরপুর-২, ঢাকা"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ডেলিভারি নোট বা বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
              <input
                type="text"
                className="form-control"
                placeholder="যেমন: বিকেল ৫টার পর ডেলিভারি দিলে ভালো হয়"
                value={formData.deliveryNote}
                onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="checkout-card">
            <h2 className="checkout-title">
              <CreditCard size={20} color="var(--primary)" />
              <span>পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                className={`payment-option-card ${formData.paymentMethod.includes('Cash') ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' })}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod.includes('Cash')}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' })}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    💵 ক্যাশ অন ডেলিভারি (Cash on Delivery)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করুন।
                  </div>
                </div>
              </div>

              <div
                className={`payment-option-card ${formData.paymentMethod.includes('bKash') ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'বিকাশ (bKash) পেমেন্ট' })}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod.includes('bKash')}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'বিকাশ (bKash) পেমেন্ট' })}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#d946ef' }}>
                    📱 বিকাশ (bKash) পেমেন্ট
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    বিকাশ মার্চেন্ট বা পার্সোনাল নম্বরে পেমেন্ট করার সুবিধা।
                  </div>
                </div>
              </div>

              {/* <div
                className={`payment-option-card ${formData.paymentMethod.includes('Nagad') ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, paymentMethod: 'নগদ (Nagad) পেমেন্ট' })}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={formData.paymentMethod.includes('Nagad')}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'নগদ (Nagad) পেমেন্ট' })}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ea580c' }}>
                    📲 নগদ (Nagad) পেমেন্ট
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    নগদ একাউন্ট থেকে সহজে পেমেন্ট করুন।
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Instant WhatsApp Notification */}
        <div>
          <div className="checkout-card" style={{ position: 'sticky', top: '90px' }}>
            <h2 className="checkout-title">
              <ShoppingBag size={20} color="var(--primary)" />
              <span>অর্ডার সারসংক্ষেপ</span>
            </h2>

            {/* Itemized Mini List */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {cartItems.map((item) => {
                const p = item.discountPrice || item.regularPrice || item.price;
                return (
                  <div
                    key={item._id || item.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '0.88rem'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.nameBn}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ৳{p} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-en)' }}>
                      ৳{p * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>পণ্যের মূল্য:</span>
                <span style={{ fontWeight: 600 }}>৳{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--danger)' }}>
                  <span>ডিসকাউন্ট:</span>
                  <span style={{ fontWeight: 600 }}>-৳{discountAmount}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1.5px dashed var(--border)',
                fontSize: '1.2rem',
                fontWeight: 800
              }}>
                <span>সর্বমোট বিল:</span>
                <span style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-en)' }}>
                  ৳{grandTotal}
                </span>
              </div>
            </div>

            {/* Automated WhatsApp Notice */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start'
            }}>
              <MessageSquare size={18} color="var(--whatsapp)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.4 }}>
                <strong>অটোমেটেড হোয়াটসঅ্যাপ কনফার্মেশন:</strong> অর্ডার করার সাথে সাথেই আপনার অর্ডারটি স্বয়ংক্রিয়ভাবে আমাদের হোয়াটসঅ্যাপ <strong>01327226437</strong> এ রেকর্ড হয়ে যাবে এবং আপনি পূর্ণ রসিদ পেয়ে যাবেন।
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem' }}
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
