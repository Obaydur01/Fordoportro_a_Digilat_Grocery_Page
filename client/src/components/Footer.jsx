import React from 'react';
import { PhoneCall, Mail, MapPin, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-main">
      <div className="fp-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'var(--primary)',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800
              }}>
                ফ
              </div>
              <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>
                ফর্দপত্র (Fordoportro)
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '320px' }}>
              বাংলাদেশের বিশ্বস্ত পাইকারি ও খুচরা অনলাইন মুদি বাজার। খাঁটি মানের চাল, ডাল, তেল, মসলা ও নিত্যপ্রয়োজনীয় গ্রোসারি সামগ্রী পৌঁছে যাবে আপনার ঠিকানায়।
            </p>

            <a
              href="https://wa.me/8801327226437?text=হ্যালো,%20ফর্দপত্র%20সম্পর্কে%20জানতে%20চাই"
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <MessageSquare size={16} />
              <span>হোয়াটসঅ্যাপে যোগাযোগ: 01327226437</span>
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-heading">কুইক মেনু</h4>
            <ul className="footer-links">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                  হোম পেজ
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}>
                  সমস্ত মুদি পণ্য
                </a>
              </li>
              <li>
                <a href="#offers" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'todays-best-offer' }); }}>
                  আজকের অফার
                </a>
              </li>
              <li>
                <a href="#dashboard" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
                  অর্ডার ট্র্যাকিং
                </a>
              </li>
              <li>
                <a href="#admin" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }}>
                  অ্যাডমিন প্যানেল
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 className="footer-heading">জনপ্রিয় ক্যাটাগরি</h4>
            <ul className="footer-links">
              <li>
                <a href="#rice" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'rice-and-pulses' }); }}>
                  চাল ও ডাল
                </a>
              </li>
              <li>
                <a href="#spices" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'spices-cooking' }); }}>
                  মসলা ও রান্নার তেল
                </a>
              </li>
              <li>
                <a href="#dairy" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'dairy-milk' }); }}>
                  দুধ ও দুগ্ধজাত সামগ্রী
                </a>
              </li>
              <li>
                <a href="#baby" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'baby-care' }); }}>
                  বেবি কেয়ার ও ফুড
                </a>
              </li>
              <li>
                <a href="#cleaning" onClick={(e) => { e.preventDefault(); onNavigate('shop', { selectedCategory: 'cleaning-items' }); }}>
                  ক্লিনিং ও ওয়াশিং
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div>
            <h4 className="footer-heading">যোগাযোগ ও সেবা</h4>
            <ul className="footer-links" style={{ gap: '0.85rem' }}>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <PhoneCall size={18} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div>হটলাইন নম্বর:</div>
                  <strong style={{ color: 'white', fontSize: '1rem', fontFamily: 'var(--font-en)' }}>
                    01327226437
                  </strong>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Mail size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>support@fordoportro.com</div>
              </li>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>ঢাকা, বাংলাদেশ (দেশব্যাপী হোম ডেলিভারি)</div>
              </li>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <a
                  href="https://www.facebook.com/share/1DaCe5HSkF/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#60a5fa', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  📘 ফেসবুক পেজ: Fordoportro
                </a>
              </li>
            </ul>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (Cash on Delivery) • বিকাশ • নগদ
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Fordoportro (ফর্দপত্র). সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8' }}>
            <span>Made with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for Bengali Grocery Shoppers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
