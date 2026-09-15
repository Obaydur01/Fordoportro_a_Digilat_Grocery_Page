import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, RefreshCw, MessageSquare } from 'lucide-react';

export default function HeroBanner({ onExplore }) {
  return (
    <section className="hero-section">
      <div className="fp-container">
        <div className="hero-grid">
          {/* Main Hero Banner */}
          <div className="hero-main-card">
            <div className="hero-glow-bg" />
            <div className="hero-tag">
              <Sparkles size={16} />
              <span>আজকের সেরা পাইকারি অফার • Fordoportro</span>
            </div>
            <h2 className="hero-title">
              ঘরে বসেই বাজারের ফর্দ করুন, <br />
              <span style={{ color: '#fef08a' }}>কম দামে তাজা পণ্য</span> বুঝে নিন!
            </h2>
            <p className="hero-desc">
              বাসমতি চাল, খাঁটি সরিষার তেল, দেশি মসুর ডাল, শিশু খাদ্য ও নিত্যপ্রয়োজনীয় গ্রোসারি সামগ্রী সবচেয়ে সাশ্রয়ী পাইকারি ও খুচরা মূল্যে।
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onExplore}
                className="btn btn-accent"
                style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}
              >
                <span>বাজার শুরু করুন (Shop Now)</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="https://wa.me/8801327226437?text=হ্যালো,%20ফর্দপত্র%20থেকে%20পণ্য%20অর্ডার%20করতে%20চাই"
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}
              >
                <MessageSquare size={18} />
                <span>হোয়াটসঅ্যাপে ফর্দ পাঠান</span>
              </a>

              <a
                href="https://www.facebook.com/share/1DaCe5HSkF/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', background: '#1877f2', color: 'white', border: 'none' }}
              >
                <span>ফেসবুক পেজ ভিজিট করুন</span>
              </a>
            </div>
          </div>

          {/* Side Promo Card */}
          {/* <div className="hero-side-card">
            <div>
              <div className="badge badge-discount" style={{ marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c' }}>
                বিশেষ ডিসকাউন্ট
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.25 }}>
                কুপন কোড: <span style={{ color: '#facc15' }}>FORDO50</span>
              </h3>
              <p style={{ fontSize: '0.88rem', opacity: 0.85, marginBottom: '1.5rem' }}>
                যেকোনো অর্ডারে ৫০ টাকা তাৎক্ষণিক ছাড় উপভোগ করুন।
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(6px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <Truck size={18} color="#4ade80" />
                <span>২৫০০৳ অর্ডারে ফ্রি ডেলিভারি!</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* 4 Feature Value Pillars */}
        <div className="perks-strip">
          <div className="perk-item">
            <div className="perk-icon-box">
              <Truck size={22} />
            </div>
            <div>
              <div className="perk-title">দ্রুততম হোম ডেলিভারি</div>
              <div className="perk-desc">অর্ডারের অল্প সময়েই পণ্য আপনার দোরগোড়ায়</div>
            </div>
          </div>

          <div className="perk-item">
            <div className="perk-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="perk-title">১০০% খাঁটি ও তাজা পণ্য</div>
              <div className="perk-desc">সরাসরি মিল ও বিশ্বস্ত ডিলার থেকে সংগৃহীত</div>
            </div>
          </div>

          <div className="perk-item">
            <div className="perk-icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <div className="perk-title">হোয়াটসঅ্যাপে সার্বক্ষণিক সেবা</div>
              <div className="perk-desc">01327226437 নম্বরে যেকোনো সহায়তায় পাশে আছি</div>
            </div>
          </div>

          <div className="perk-item">
            <div className="perk-icon-box" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <div className="perk-title">ক্যাশ অন ডেলিভারি (COD)</div>
              <div className="perk-desc">পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
