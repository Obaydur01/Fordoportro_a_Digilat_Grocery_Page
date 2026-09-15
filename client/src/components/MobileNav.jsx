import React from 'react';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MobileNav({ currentView, onNavigate }) {
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  return (
    <div className="mobile-bottom-nav">
      <button
        onClick={() => onNavigate('home')}
        className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>হোম</span>
      </button>

      <button
        onClick={() => onNavigate('shop')}
        className={`mobile-nav-item ${currentView === 'shop' ? 'active' : ''}`}
      >
        <ShoppingBag size={20} />
        <span>শপ</span>
      </button>

      <button
        onClick={() => setIsWishlistOpen(true)}
        className="mobile-nav-item"
      >
        <Heart size={20} />
        <span>উইশলিস্ট</span>
        {wishlistCount > 0 && (
          <span className="badge-counter" style={{ top: '-4px', right: '10px' }}>
            {wishlistCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="mobile-nav-item"
      >
        <ShoppingCart size={20} />
        <span>কার্ট</span>
        {cartCount > 0 && (
          <span className="badge-counter" style={{ top: '-4px', right: '10px' }}>
            {cartCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onNavigate('dashboard')}
        className={`mobile-nav-item ${currentView === 'dashboard' || currentView === 'login' ? 'active' : ''}`}
      >
        <User size={20} />
        <span>অ্যাকাউন্ট</span>
      </button>
    </div>
  );
}
