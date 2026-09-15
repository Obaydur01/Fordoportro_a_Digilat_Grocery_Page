const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// GET /api/employees - Get all employees
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const employees = await db.collection('employees').find({}).sort({ joinedDate: -1 }).toArray();
    res.json({ success: true, count: employees.length, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees - Add employee
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { name, email, phone, role, department, status, salary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'কর্মচারীর নাম ও মোবাইল নম্বর আবশ্যক' });
    }

    const newEmployee = {
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone.trim(),
      role: role || 'Staff', // Admin, Manager, Order Dispatcher, Delivery Staff, Staff
      department: department || 'General',
      status: status || 'Active', // Active, Inactive
      salary: salary ? Number(salary) : 0,
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    const result = await db.collection('employees').insertOne(newEmployee);
    newEmployee._id = result.insertedId;

    res.status(201).json({ success: true, employee: newEmployee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ কর্মচারী আইডি' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    if (updateData._id) delete updateData._id;

    const result = await db.collection('employees').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    res.json({ success: true, employee: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'অবৈধ আইডি' });
    }

    await db.collection('employees').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: 'কর্মচারী সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
