import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const cartKey = currentUser?.uid ? `fp_cart_${currentUser.uid}` : 'fp_cart_guest';

  const [cartItems, setCartItems] = useState(() => {
    try {
      const key = currentUser?.uid ? `fp_cart_${currentUser.uid}` : 'fp_cart_guest';
      const saved = localStorage.getItem(key) || localStorage.getItem('fp_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState('inside-dhaka'); // inside-dhaka or outside-dhaka
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Switch cart when customer changes
  useEffect(() => {
    const key = currentUser?.uid ? `fp_cart_${currentUser.uid}` : 'fp_cart_guest';
    try {
      const saved = localStorage.getItem(key);
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCartItems([]);
    }
  }, [currentUser?.uid]);

  // Sync to active customer's storage
  useEffect(() => {
    const key = currentUser?.uid ? `fp_cart_${currentUser.uid}` : 'fp_cart_guest';
    try {
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems, currentUser?.uid]);

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => (item._id || item.slug) === (product._id || product.slug));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            quantity: quantity,
            price: product.discountPrice || product.regularPrice || 0
          }
        ];
      }
    });
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if ((item._id || item.slug) === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => (item._id || item.slug) !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setCouponCode('');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.regularPrice || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Delivery fee: Inside Dhaka = 60, Outside = 120, Free if subtotal >= 2500
  const deliveryFee = 0;

  // Apply promo coupon
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FORDO50') {
      const discount = Math.min(50, subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponCode('FORDO50');
      return { success: true, message: '৫০ টাকা ছাড় সফলভাবে যুক্ত হয়েছে!' };
    } else if (clean === 'FREEDEL') {
      setDiscountAmount(deliveryFee);
      setCouponCode('FREEDEL');
      return { success: true, message: 'ফ্রি ডেলিভারি ভাউচার গ্রহণ করা হয়েছে!' };
    } else {
      return { success: false, message: 'অবৈধ কুপন কোড' };
    }
  };

  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryZone,
    setDeliveryZone,
    couponCode,
    applyCoupon,
    discountAmount,
    subtotal,
    deliveryFee,
    grandTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
