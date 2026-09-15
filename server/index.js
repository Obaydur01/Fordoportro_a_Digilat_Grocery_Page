require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { connectDB, getDB } = require('./config/db');
// NOTE: seedData auto-seeding disabled — products/employees managed via admin panel only.

const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const employeesRoutes = require('./routes/employees');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');
const { router: authRoutes, ensureSuperAdmin } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database initialization promise for serverless cold-starts
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

// Serve static frontend in production / standalone
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

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

// Single Page Application Fallback (Express 5 compatible)
app.use((req, res) => {
  const indexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Fordoportro API Server is active.');
  }
});


// Start Server
async function startServer() {
  try {
    console.log('Connecting to database and initializing...');
    await getInitializedDB();

    app.listen(PORT, () => {
      console.log(`🚀 Fordoportro Server running on http://localhost:${PORT}`);
      console.log(`📱 Automated WhatsApp Orders Hotline: 01327226437`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start server locally when not running as a Vercel serverless function
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export for Vercel serverless
module.exports = app;

