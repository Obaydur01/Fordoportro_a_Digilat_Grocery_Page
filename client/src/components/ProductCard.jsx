import React from 'react';
import { Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onSelect }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productId = product._id || product.slug;
  const isWish = isInWishlist(productId);

  const cartItem = cartItems.find(item => (item._id || item.slug) === productId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const regular = Number(product.regularPrice) || 0;
  const current = Number(product.discountPrice) || regular;
  const hasDiscount = regular > current;
  const discountPercent = hasDiscount ? Math.round(((regular - current) / regular) * 100) : 0;

  return (
    <div className="product-card">
      {/* Product Image Area */}
      <div className="product-img-wrapper" onClick={() => onSelect && onSelect(product)} style={{ cursor: 'pointer' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.nameBn}
          className="product-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="card-badges">
          {hasDiscount && (
            <span className="badge badge-discount">
              -{discountPercent}%
            </span>
          )}
          {product.isHot && (
            <span className="badge badge-hot">
              🔥 হট
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`wishlist-heart-btn ${isWish ? 'active' : ''}`}
          title={isWish ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যুক্ত করুন"}
        >
          <Heart size={18} fill={isWish ? '#ef4444' : 'none'} color={isWish ? '#ef4444' : '#64748b'} />
        </button>
      </div>

      {/* Info Area */}
      <div className="product-info">
        <div>
          <div className="product-category-label">
            {product.category || 'মুদি বাজার'}
          </div>
          <h3
            className="product-title"
            onClick={() => onSelect && onSelect(product)}
            style={{ cursor: 'pointer' }}
            title={product.nameBn}
          >
            {product.nameBn}
          </h3>
          <div className="product-unit">
            পরিমাণ: {product.unit || '১ পিস'}
          </div>
        </div>

        <div>
          {/* Pricing */}
          <div className="product-pricing">
            <span className="price-current">৳{current}</span>
            {hasDiscount && (
              <span className="price-regular">৳{regular}</span>
            )}
          </div>

          {/* Cart Stepper or Add Button */}
          <div className="card-action-bar">
            {qtyInCart > 0 ? (
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, qtyInCart - 1)}
                  className="qty-stepper-btn"
                  title="কমান"
                >
                  <Minus size={16} />
                </button>
                <span className="qty-stepper-val">{qtyInCart}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, qtyInCart + 1)}
                  className="qty-stepper-btn"
                  title="বাড়ান"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, 1)}
                className="add-to-cart-btn"
              >
                <ShoppingBag size={16} />
                <span>কার্টে যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
