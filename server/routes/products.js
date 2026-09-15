const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const cache = require('../utils/cache');

// GET /api/products - Get products with filtering, search, and TTL caching
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, hot, sort, limit, page } = req.query;
    const cacheKey = `products:${category || ''}:${search || ''}:${featured || ''}:${hot || ''}:${sort || ''}:${page || 1}:${limit || 100}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    const db = getDB();
    const query = {};

    if (category && category !== 'all') {
      query.$or = [
        { categorySlug: category },
        { category: category }
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (hot === 'true') {
      query.isHot = true;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameBn: { $regex: regex } },
        { nameEn: { $regex: regex } },
        { category: { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { discountPrice: 1 };
    if (sort === 'price-desc') sortOption = { discountPrice: -1 };
    if (sort === 'discount') sortOption = { regularPrice: -1 };

    const pageNum = parseInt(page) || 1;
    const limitNum = limit ? parseInt(limit) : 1000;
    const skip = (pageNum - 1) * limitNum;

    const total = await db.collection('products').countDocuments(query);
    const products = await db.collection('products')
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const responsePayload = {
      success: true,
      count: products.length,
      total,
      page: pageNum,
      products
    };

    // Store in cache for 2 minutes (120,000ms)
    cache.set(cacheKey, responsePayload, 120 * 1000);
    res.setHeader('X-Cache', 'MISS');
    res.json(responsePayload);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id - Get single product with cache
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const db = getDB();
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { slug: id }] };
    } else {
      query = { slug: id };
    }

    const product = await db.collection('products').findOne(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি' });
    }

    const payload = { success: true, product };
    cache.set(cacheKey, payload, 300 * 1000); // 5 min
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products - Create product (Admin) + Invalidate Cache
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const {
      nameBn,
      nameEn,
      category,
      categorySlug,
      regularPrice,
      discountPrice,
      unit,
      stock,
      image,
      description,
      isFeatured,
      isHot
    } = req.body;

    if (!nameBn || !regularPrice) {
      return res.status(400).json({ success: false, message: 'পণ্যের নাম ও মূল্য আবশ্যক' });
    }

    let baseSlug = (nameEn || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) {
      baseSlug = 'prod-' + Date.now().toString(36);
    }
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newProduct = {
      nameBn,
      nameEn: nameEn || nameBn,
      slug,
      category: category || 'মুদি বাজার',
      categorySlug: categorySlug || 'grocery',
      regularPrice: Number(regularPrice),
      discountPrice: discountPrice ? Number(discountPrice) : Number(regularPrice),
      unit: unit || '১ পিস',
      stock: stock !== undefined ? Number(stock) : 50,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: description || '',
      isFeatured: Boolean(isFeatured),
      isHot: Boolean(isHot),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(newProduct);
    newProduct._id = result.insertedId;

    // Cache invalidation
    cache.clearPrefix('products:');
    cache.clearPrefix('stats:');

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id - Update product (Admin) + Invalidate Cache
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ পণ্য আইডি' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    if (updateData._id) delete updateData._id;

    if (updateData.regularPrice) updateData.regularPrice = Number(updateData.regularPrice);
    if (updateData.discountPrice) updateData.discountPrice = Number(updateData.discountPrice);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    // Cache invalidation
    cache.clearPrefix('products:');
    cache.clearPrefix('product:');
    cache.clearPrefix('stats:');

    res.json({ success: true, product: result });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin) + Invalidate Cache
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ পণ্য আইডি' });
    }

    await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    // Cache invalidation
    cache.clearPrefix('products:');
    cache.clearPrefix('product:');
    cache.clearPrefix('stats:');

    res.json({ success: true, message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
