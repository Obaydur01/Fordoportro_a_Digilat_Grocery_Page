import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, MessageSquare, PhoneCall, ArrowRight, Package, Home, Printer } from 'lucide-react';

export default function OrderSuccess({ order, whatsappData, onGoHome, onTrackOrder }) {
  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) { }
  }, []);

  if (!order) {
    return (
      <div className="fp-container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>কোনো অর্ডার পাওয়া যায়নি</h2>
        <button onClick={onGoHome} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          হোমে ফিরুন
        </button>
      </div>
    );
  }

  // Pre-generate WhatsApp direct URL if not already returned
  const whatsappUrl = whatsappData?.businessWhatsAppLink ||
    `https://wa.me/8801327226437?text=${encodeURIComponent(
      `🛍️ নতুন অর্ডার - ফর্দপত্র (Fordoportro)\nঅর্ডার আইডি: #${order.orderNumber}\nগ্রাহক: ${order.customerName} (${order.customerPhone})\nঠিকানা: ${order.shippingAddress}\nসর্বমোট বিল: ৳${order.grandTotal}\nপেমেন্ট: ${order.paymentMethod}`
    )}`;

  return (
    <div className="fp-container" style={{ padding: '2rem 1.25rem 5rem' }}>
      <div className="success-container">
        {/* Success Icon */}
        <div className="success-icon-box">
          <CheckCircle size={44} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে 🎉
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          আমাদের প্রতিনিধি খুব শীঘ্রই পণ্যগুলো প্রস্তুত করে ডেলিভারির ব্যবস্থা করবেন।
        </p>

        <div className="order-id-badge">
          অর্ডার ট্র্যাকিং আইডি: <strong>#{order.orderNumber}</strong>
        </div>

        {/* WhatsApp Automated Notification Box */}
        <div className="whatsapp-automated-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={20} color="var(--whatsapp)" />
            <strong style={{ fontSize: '1.02rem', color: '#166534' }}>
              অটোমেটেড হোয়াটসঅ্যাপ বার্তা প্রস্তুত!
            </strong>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#166534', marginBottom: '1rem', lineHeight: 1.5 }}>
            আপনার এই অর্ডারের সম্পূর্ণ বিবরণী ফর্দপত্র হোয়াটসঅ্যাপ বিজনেস একাউন্ট <strong>01327226437</strong> এ প্রস্তুত করা হয়েছে। সরাসরি রসিদ দেখতে বা চ্যাট করতে নিচের বাটনে চাপ দিন:
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            <MessageSquare size={18} />
            <span>হোয়াটসঅ্যাপে বিস্তারিত রসিদ দেখুন (01327226437)</span>
          </a>
        </div>

        {/* Invoice Summary Card */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            অর্ডার বিবরণ
          </h3>

          <div style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            <div><strong>গ্রাহকের নাম:</strong> {order.customerName}</div>
            <div><strong>ফোন নম্বর:</strong> {order.customerPhone}</div>
            <div><strong>ডেলিভারি ঠিকানা:</strong> {order.shippingAddress}, {order.city}</div>
            <div><strong>পেমেন্ট পদ্ধতি:</strong> {order.paymentMethod}</div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            {order.items?.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.25rem 0' }}>
                <span>{it.name} ({it.unit}) × {it.quantity}</span>
                <span style={{ fontWeight: 600 }}>৳{(it.price || 0) * (it.quantity || 1)}</span>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px dashed #cbd5e1',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'var(--primary-dark)'
            }}>
              <span>সর্বমোট পরিশোধযোগ্য:</span>
              <span>৳{order.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onGoHome} className="btn btn-secondary">
            <Home size={18} />
            <span>হোমে ফিরুন</span>
          </button>

          <button onClick={() => onTrackOrder(order)} className="btn btn-primary">
            <Package size={18} />
            <span>অর্ডার ট্র্যাক করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
