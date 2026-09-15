import React from 'react';

export default function CategoryBar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-nav-bar">
      <div className="fp-container category-nav-scroll">
        <button
          onClick={() => onSelectCategory('all')}
          className={`cat-nav-pill ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          <span>✨</span>
          <span>সব পণ্য (All)</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id || cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`cat-nav-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
          >
            <span>{cat.icon || '🛍️'}</span>
            <span>{cat.nameBn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
