const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { categories, products, employees } = require('../seed/seedData');
const cache = require('../utils/cache');

// GET /api/admin/stats - Overview analytics for Admin Dashboard with Cache
router.get('/stats', async (req, res) => {
  try {
    const cacheKey = 'stats:admin:overview';
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const db = getDB();

    const [
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalEmployees,
      recentOrders,
      ordersAgg
    ] = await Promise.all([
      db.collection('products').countDocuments({}),
      db.collection('products').countDocuments({ stock: { $lte: 10 } }),
      db.collection('orders').countDocuments({}),
      db.collection('orders').countDocuments({ status: 'Pending' }),
      db.collection('employees').countDocuments({}),
      db.collection('orders').find({}).sort({ createdAt: -1 }).limit(6).toArray(),
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$grandTotal" }
          }
        }
      ]).toArray()
    ]);

    const totalRevenue = ordersAgg.length > 0 ? ordersAgg[0].totalSales : 0;

    const payload = {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalEmployees
      },
      recentOrders
    };

    cache.set(cacheKey, payload, 30 * 1000); // 30s cache
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/seed - Seed database with realistic Gazi Paikari Bazar catalog
router.post('/seed', async (req, res) => {
  try {
    const db = getDB();

    // Check if products already exist
    const prodCount = await db.collection('products').countDocuments({});
    if (prodCount === 0 || req.query.force === 'true') {
      if (req.query.force === 'true') {
        await db.collection('products').deleteMany({});
        await db.collection('categories').deleteMany({});
        await db.collection('employees').deleteMany({});
      }

      await db.collection('categories').insertMany(categories);
      await db.collection('products').insertMany(products.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      })));
      await db.collection('employees').insertMany(employees);

      return res.json({
        success: true,
        message: 'ডাটাবেজে সফলভাবে ক্যাটাগরি, পণ্য ও কর্মচারী সিড করা হয়েছে!',
        categoriesCount: categories.length,
        productsCount: products.length,
        employeesCount: employees.length
      });
    }

    res.json({
      success: true,
      message: 'পণ্যসমূহ ইতিমধ্যেই ডাটাবেজে রয়েছে',
      productsCount: prodCount
    });
  } catch (err) {
    console.error("Error seeding DB:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
