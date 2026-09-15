const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// GET /api/wishlist/:userId - Get customer wishlist
router.get('/:userId', async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.params;

    const wishlistDoc = await db.collection('wishlists').findOne({ userId });
    res.json({
      success: true,
      items: wishlistDoc ? wishlistDoc.items : []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wishlist/:userId - Sync/Update customer wishlist
router.post('/:userId', async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const { items } = req.body;

    await db.collection('wishlists').updateOne(
      { userId },
      {
        $set: {
          items: items || [],
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'উইশলিস্ট সংরক্ষিত হয়েছে', items: items || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
