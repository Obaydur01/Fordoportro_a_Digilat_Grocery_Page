const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const {
  sendAutomatedWhatsAppNotification,
  buildWhatsAppLink,
  BUSINESS_WHATSAPP_RAW
} = require('../services/whatsapp');
const cache = require('../utils/cache');

// GET /api/orders - List all orders (Admin or Customer filter)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { status, customerPhone, customerEmail, userId, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Customer-specific filter (matches userId OR customerEmail OR customerPhone)
    const customerCriteria = [];
    if (userId) customerCriteria.push({ userId });
    if (customerEmail) {
      customerCriteria.push({ customerEmail: new RegExp(`^${customerEmail.trim()}$`, 'i') });
    }
    if (customerPhone) {
      customerCriteria.push({ customerPhone: customerPhone.trim() });
    }

    if (customerCriteria.length === 1) {
      Object.assign(query, customerCriteria[0]);
    } else if (customerCriteria.length > 1) {
      query.$or = customerCriteria;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await db.collection('orders').countDocuments(query);
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      count: orders.length,
      total,
      orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id - Get single order details
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { orderNumber: id }] };
    } else {
      query = { orderNumber: id };
    }

    const order = await db.collection('orders').findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders - Place a new order with automated WhatsApp notification
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      deliveryArea,
      deliveryNote,
      items,
      subtotal,
      deliveryFee,
      discountAmount,
      grandTotal,
      paymentMethod,
      userId
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'গ্রাহকের নাম, মোবাইল নম্বর, ঠিকানা ও পণ্যের বিবরণ আবশ্যক'
      });
    }

    // Generate readable Order Number FP-xxxxx
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FP-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const newOrder = {
      orderNumber,
      userId: userId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : null,
      shippingAddress: shippingAddress.trim(),
      city: city || 'ঢাকা',
      deliveryArea: deliveryArea || 'inside-dhaka',
      deliveryNote: deliveryNote || '',
      items: items.map(item => ({
        productId: item._id || item.productId || null,
        name: item.nameBn || item.name || 'পণ্য',
        nameEn: item.nameEn || '',
        price: item.discountPrice || item.price || item.regularPrice || 0,
        regularPrice: item.regularPrice || 0,
        unit: item.unit || '১ পিস',
        quantity: item.quantity || 1,
        image: item.image || ''
      })),
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 60,
      discountAmount: Number(discountAmount) || 0,
      grandTotal: Number(grandTotal) || 0,
      paymentMethod: paymentMethod || 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
      paymentStatus: 'Pending',
      status: 'Pending', // Pending, Confirmed, Processing, Out for Delivery, Delivered, Cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 1. Insert into MongoDB Atlas
    const insertResult = await db.collection('orders').insertOne(newOrder);
    newOrder._id = insertResult.insertedId;

    // 2. Trigger automated WhatsApp notification to Business (01327226437) and prepare client link
    let whatsappResult = null;
    try {
      whatsappResult = await sendAutomatedWhatsAppNotification(newOrder);
    } catch (waErr) {
      console.error("WhatsApp notification error:", waErr.message);
    }

    // Deduct stock from products (optional inventory management)
    for (const it of newOrder.items) {
      if (it.productId && ObjectId.isValid(it.productId)) {
        await db.collection('products').updateOne(
          { _id: new ObjectId(it.productId) },
          { $inc: { stock: -it.quantity } }
        ).catch(() => { });
      }
    }

    // Invalidate stats and product caches
    cache.clearPrefix('stats:');
    cache.clearPrefix('products:');

    res.status(201).json({
      success: true,
      message: 'অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!',
      order: newOrder,
      whatsapp: whatsappResult
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/status - Update Order Status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status, paymentStatus, deliveryStaff } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ অর্ডার আইডি' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'অবৈধ স্ট্যাটাস' });
    }

    const updateFields = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (deliveryStaff) updateFields.deliveryStaff = deliveryStaff;

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    cache.clearPrefix('stats:');
    res.json({ success: true, order: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
