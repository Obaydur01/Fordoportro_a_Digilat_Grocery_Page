/**
 * app.js - cPanel Passenger Entry Point for Fordoportro
 * 
 * cPanel's Node.js Passenger manages the port and process lifecycle.
 * This file loads the Express app WITHOUT calling app.listen() manually.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDB, getDB } = require('./server/config/db');
// NOTE: seedData auto-seeding disabled — products/employees managed via admin panel only.

const productsRoutes = require('./server/routes/products');
const categoriesRoutes = require('./server/routes/categories');
const ordersRoutes = require('./server/routes/orders');
const employeesRoutes = require('./server/routes/employees');
const wishlistRoutes = require('./server/routes/wishlist');
const adminRoutes = require('./server/routes/admin');
const { router: authRoutes, ensureSuperAdmin } = require('./server/routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database initialization
let initPromise = null;
function getInitializedDB() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await ensureSuperAdmin();
    })();
  }
  return initPromise;
}

// Initialize DB eagerly on startup (don't wait for first request)
getInitializedDB().then(() => {
  console.log('✅ Fordoportro DB initialized successfully');
}).catch(err => {
  console.warn('⚠️ DB init warning (fallback active):', err.message);
});

// Middleware to ensure DB is connected before processing /api requests
app.use('/api', async (req, res, next) => {
  try {
    await getInitializedDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Fordoportro API Server',
    whatsappHotline: '01327226437',
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback - serve React app for all non-API routes
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Fordoportro API Server is active.');
  }
});


// Export app for cPanel Passenger (Passenger handles listen())
module.exports = app;
