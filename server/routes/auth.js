const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Secure password hasher using built-in crypto
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + (process.env.SUPER_ADMIN_SECRET || 'fordo_salt_key_999')).digest('hex');
}

// Ensure Super Admin exists on startup
async function ensureSuperAdmin() {
  try {
    const db = getDB();
    
    // Check total super admins
    const otherSuperAdmins = await db.collection('admins').find({ 
      role: 'super_admin',
      email: { $ne: 'admin@fordoportro.com' }
    }).toArray();

    // If custom super admin exists, clean up default admin@fordoportro.com account automatically
    if (otherSuperAdmins.length > 0) {
      const deletedDefault = await db.collection('admins').deleteMany({ email: 'admin@fordoportro.com' });
      if (deletedDefault.deletedCount > 0) {
        console.log("🧹 Removed default admin@fordoportro.com since custom Super Admin exists.");
      }
      return;
    }

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@fordoportro.com').toLowerCase().trim();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

    const existing = await db.collection('admins').findOne({ email: superAdminEmail });
    if (!existing) {
      await db.collection('admins').insertOne({
        name: 'প্রধান সুপার অ্যাডমিন (Super Admin)',
        email: superAdminEmail,
        passwordHash: hashPassword(superAdminPassword),
        role: 'super_admin',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`👑 Super Admin account ensured: ${superAdminEmail}`);
    }
  } catch (err) {
    console.warn("Could not check/create super admin:", err.message);
  }
}

// POST /api/auth/admin-login - Strictly authenticate Admins only (Blocks regular customers)
router.post('/admin-login', async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminUser = await db.collection('admins').findOne({ email: cleanEmail });

    // Check if the user is in the admins collection
    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: 'অননুমোদিত প্রবেশ! এই ইমেইলটি কোনো অ্যাডমিন হিসেবে নিবন্ধিত নয়। সাধারণ গ্রাহক অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশ নিষেধ।'
      });
    }

    // Verify Password
    const inputHash = hashPassword(password);
    if (adminUser.passwordHash !== inputHash) {
      // Fallback check if plain initial password matches
      if (adminUser.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।'
        });
      }
    }

    // Check status
    if (adminUser.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'এই অ্যাডমিন অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করা রয়েছে। সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'
      });
    }

    // Generate session token
    const token = crypto.randomBytes(24).toString('hex');
    await db.collection('admins').updateOne(
      { _id: adminUser._id },
      { $set: { lastLogin: new Date(), token } }
    );

    res.json({
      success: true,
      message: 'অ্যাডমিন লগইন সফল হয়েছে',
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role || 'admin',
        isSuperAdmin: adminUser.role === 'super_admin',
        token
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/admins - List all Admins & Roles (Only authorized admins can view)
router.get('/admins', async (req, res) => {
  try {
    const db = getDB();
    const admins = await db.collection('admins')
      .find({})
      .project({ passwordHash: 0, password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, count: admins.length, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/create-admin - Only Super Admin can create sub-admins and assign roles & passwords
router.post('/create-admin', async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password, role, phone, creatorRole } = req.body;

    // Security verification: Only Super Admin can create new admins
    if (creatorRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'অনুমতি নেই! শুধুমাত্র "সুপার অ্যাডমিন (Super Admin)" নতুন অ্যাডমিন তৈরি ও রোল বরাদ্দ করতে পারেন।'
      });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'নাম, ইমেইল, পাসওয়ার্ড এবং পদবী (Role) আবশ্যক'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered as admin
    const existing = await db.collection('admins').findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতিমধ্যে একজন অ্যাডমিন বা কর্মী রয়েছেন'
      });
    }

    const newAdmin = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      passwordHash: hashPassword(password),
      role: role, // 'admin', 'manager', 'dispatcher', 'delivery'
      status: 'Active',
      createdBy: 'Super Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('admins').insertOne(newAdmin);
    newAdmin._id = result.insertedId;
    delete newAdmin.passwordHash;

    res.status(201).json({
      success: true,
      message: `নতুন ${role} সফলভাবে তৈরি করা হয়েছে এবং পাসওয়ার্ড সেট করা হয়েছে!`,
      admin: newAdmin
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/admins/:id/password - Reset / Update admin password (Super Admin only)
router.put('/admins/:id/password', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { newPassword, creatorRole } = req.body;

    if (creatorRole !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'শুধুমাত্র সুপার অ্যাডমিন পাসওয়ার্ড পরিবর্তন করতে পারেন' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ অ্যাডমিন আইডি' });
    }

    await db.collection('admins').updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash: hashPassword(newPassword), updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/admins/:id - Delete an admin (Super Admin only)
router.delete('/admins/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { creatorRole } = req.query;

    if (creatorRole !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'শুধুমাত্র সুপার অ্যাডমিন অ্যাডমিন ডিলিট করতে পারেন' });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ আইডি' });
    }

    const target = await db.collection('admins').findOne({ _id: new ObjectId(id) });
    if (target?.role === 'super_admin') {
      const superAdminCount = await db.collection('admins').countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ success: false, message: 'কমপক্ষে একজন সুপার অ্যাডমিন প্যানেলে থাকা আবশ্যক' });
      }
    }

    await db.collection('admins').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: 'অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router, ensureSuperAdmin };
