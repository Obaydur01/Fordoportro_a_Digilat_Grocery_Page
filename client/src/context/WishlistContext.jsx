import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const storageKey = currentUser?.uid ? `fp_wishlist_${currentUser.uid}` : 'fp_wishlist_guest';

  const [wishlist, setWishlist] = useState(() => {
    try {
      const key = currentUser?.uid ? `fp_wishlist_${currentUser.uid}` : 'fp_wishlist_guest';
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Switch wishlist whenever currentUser changes
  useEffect(() => {
    if (currentUser?.uid) {
      // 1. Load from this user's local cache immediately
      try {
        const local = localStorage.getItem(`fp_wishlist_${currentUser.uid}`);
        if (local) {
          setWishlist(JSON.parse(local));
        } else {
          setWishlist([]);
        }
      } catch (e) {
        setWishlist([]);
      }

      // 2. Fetch latest wishlist for this specific customer from MongoDB Atlas
      fetch(`/api/wishlist/${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.items)) {
            setWishlist(data.items);
            try {
              localStorage.setItem(`fp_wishlist_${currentUser.uid}`, JSON.stringify(data.items));
            } catch (e) {}
          }
        })
        .catch(() => {});
    } else {
      // Guest / logged-out user
      try {
        const guestSaved = localStorage.getItem('fp_wishlist_guest');
        setWishlist(guestSaved ? JSON.parse(guestSaved) : []);
      } catch (e) {
        setWishlist([]);
      }
    }
  }, [currentUser?.uid]);

  // Sync wishlist updates to both storage and Atlas
  const syncWishlist = useCallback((updatedList) => {
    setWishlist(updatedList);
    const key = currentUser?.uid ? `fp_wishlist_${currentUser.uid}` : 'fp_wishlist_guest';
    try {
      localStorage.setItem(key, JSON.stringify(updatedList));
    } catch (e) {}

    // Persist to MongoDB Atlas for logged-in customer
    if (currentUser?.uid) {
      fetch(`/api/wishlist/${currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedList })
      }).catch(() => {});
    }
  }, [currentUser?.uid]);

  // Toggle in wishlist
  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => (item._id || item.slug) === (product._id || product.slug));
    const updated = exists
      ? wishlist.filter(item => (item._id || item.slug) !== (product._id || product.slug))
      : [...wishlist, product];
    syncWishlist(updated);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item.slug) === productId);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => (item._id || item.slug) !== productId);
    syncWishlist(updated);
  };

  const clearWishlist = () => {
    syncWishlist([]);
  };

  const value = {
    wishlist,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    clearWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
