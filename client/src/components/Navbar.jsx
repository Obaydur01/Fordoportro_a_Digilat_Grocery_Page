import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentView, searchQuery, setSearchQuery }) {
  const { cartCount, subtotal, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { currentUser, isAdmin, logout } = useAuth();

  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Live search preview
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products) {
            setSearchResults(data.products);
            setShowDropdown(data.products.length > 0);
          }
        })
        .catch(() => { });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="fp-container top-bar-inner">
          <div className="top-bar-left">
            <a
              href="https://wa.me/8801327226437"
              target="_blank"
              rel="noreferrer"
              className="top-bar-item top-bar-hotline"
            >
              <PhoneCall size={13} className="hotline-highlight" />
              <span className="top-bar-label">হটলাইন:</span>
              <strong className="hotline-highlight">01327226437</strong>
            </a>
            <span className="top-bar-item top-bar-hours">
              <Clock size={13} />
              <span>ডেলিভারি: সকাল ৮টা - রাত ১০টা</span>
            </span>
          </div>

          <div className="top-bar-right">
            <span className="top-bar-item top-bar-location">
              <MapPin size={13} />
              <span>ঢাকা মিরপুরে হোম ডেলিভারি</span>
            </span>

            {/* Admin Switcher Quick Link */}
            <button
              onClick={() => onNavigate('admin')}
              className="top-bar-item top-bar-admin"
              title="অ্যাডমিন প্যানেল"
            >
              <ShieldCheck size={13} />
              <span>অ্যাডমিন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className="navbar-sticky">
        <div className="fp-container navbar-main">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="brand-logo"
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon-box">
              <Sparkles size={24} />
            </div>
            <div className="brand-text-wrap">
              <h1 className="brand-title">
                ফর্দপত্র <span>.</span>
              </h1>
              <span className="brand-subtitle">FORDOPORTRO GROCERY</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="navbar-actions">
            {/* Quick WhatsApp Call on Mobile */}
            <a
              href="https://wa.me/8801327226437"
              target="_blank"
              rel="noreferrer"
              className="nav-action-btn nav-action-wa-mobile"
              title="হোয়াটসঅ্যাপ"
            >
              <PhoneCall size={18} color="#16a34a" />
            </a>

            {/* Wishlist Button (Desktop & Tablet) */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="nav-action-btn nav-action-wishlist"
              title="উইশলিস্ট (Wishlist)"
            >
              <Heart size={20} color={wishlistCount > 0 ? '#ef4444' : '#64748b'} />
              <span className="nav-btn-text">উইশলিস্ট</span>
              {wishlistCount > 0 && (
                <span className="badge-counter">{wishlistCount}</span>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="nav-action-btn cart-pill-btn"
              title="শপিং ব্যাগ"
            >
              <ShoppingCart size={19} />
              <div className="cart-pill-info">
                <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>কার্ট ({cartCount})</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>৳{subtotal}</span>
              </div>
              {cartCount > 0 && (
                <span className="badge-counter mobile-cart-badge">{cartCount}</span>
              )}
            </button>

            {/* User Account / Login */}
            {currentUser ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="nav-action-btn nav-action-account"
                title="আমার অ্যাকাউন্ট"
              >
                <User size={18} color="var(--primary)" />
                <span className="nav-btn-text user-name-truncate">
                  {currentUser.displayName}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="nav-action-btn nav-action-account"
              >
                <User size={18} />
                <span className="nav-btn-text">লগইন</span>
              </button>
            )}
          </div>

          {/* Search Bar (flows into full-width row on mobile) */}
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrap">
              <input
                type="text"
                placeholder="চাল, ডাল, তেল, চিনি, মসলা বা যেকোনো পণ্য খুঁজুন..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowDropdown(false);
                    onNavigate('shop');
                  }
                }}
              />
              <button
                className="search-btn"
                onClick={() => {
                  setShowDropdown(false);
                  onNavigate('shop');
                }}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Search Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((product) => (
                  <div
                    key={product._id || product.slug}
                    className="search-dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      onNavigate('shop', { selectedCategory: product.categorySlug });
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.nameBn}
                      className="search-item-img"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.nameBn}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {product.category} • {product.unit}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>
                      ৳{product.discountPrice || product.regularPrice}
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigate('shop');
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  সব ফলাফল দেখুন ⟶
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
