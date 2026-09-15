const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const cache = require('../utils/cache');

// GET /api/categories - List all categories with TTL Cache
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'categories:all';
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const db = getDB();
    const categories = await db.collection('categories').find({}).toArray();
    const payload = { success: true, count: categories.length, categories };

    cache.set(cacheKey, payload, 600 * 1000); // 10 minutes
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories - Create category (Admin) + Invalidate Cache
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { nameBn, nameEn, icon, image, description } = req.body;

    if (!nameBn) {
      return res.status(400).json({ success: false, message: 'ক্যাটাগরির নাম আবশ্যক' });
    }

    let slug = (nameEn || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!slug) {
      slug = 'cat-' + Date.now().toString(36);
    }

    const newCategory = {
      nameBn,
      nameEn: nameEn || nameBn,
      slug,
      icon: icon || '🛍️',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
      description: description || '',
      createdAt: new Date()
    };

    const result = await db.collection('categories').insertOne(newCategory);
    newCategory._id = result.insertedId;

    cache.clearPrefix('categories:');
    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id - Update category (Admin) + Invalidate Cache
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ ক্যাটাগরি আইডি' });
    }

    const existingCat = await db.collection('categories').findOne({ _id: new ObjectId(id) });
    if (!existingCat) {
      return res.status(404).json({ success: false, message: 'ক্যাটাগরি পাওয়া যায়নি' });
    }

    const { nameBn, nameEn, icon, image, description } = req.body;

    if (!nameBn || !nameBn.trim()) {
      return res.status(400).json({ success: false, message: 'ক্যাটাগরির বাংলা নাম আবশ্যক' });
    }

    let slug = req.body.slug;
    if (!slug && nameEn) {
      slug = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (!slug) {
      slug = existingCat.slug;
    }

    const updateData = {
      nameBn: nameBn.trim(),
      nameEn: (nameEn || nameBn).trim(),
      slug,
      icon: icon || existingCat.icon || '🛍️',
      image: image || existingCat.image || '',
      description: description || '',
      updatedAt: new Date()
    };

    const updatedCategory = await db.collection('categories').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    // Cascading update: If nameBn or slug changed, update all products that belong to this category!
    if (existingCat.slug !== slug || existingCat.nameBn !== updateData.nameBn) {
      await db.collection('products').updateMany(
        { $or: [{ categorySlug: existingCat.slug }, { category: existingCat.nameBn }] },
        { $set: { categorySlug: slug, category: updateData.nameBn, updatedAt: new Date() } }
      );
      cache.clearPrefix('products:');
      cache.clearPrefix('product:');
    }

    cache.clearPrefix('categories:');
    res.json({ success: true, category: updatedCategory });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id - Delete category + Invalidate Cache
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ আইডি' });
    }

    await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
    cache.clearPrefix('categories:');
    res.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
