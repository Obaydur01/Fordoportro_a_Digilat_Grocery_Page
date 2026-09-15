# 🛍️ ফর্দপত্র (Fordoportro)

> **Bangladeshi Online Grocery & Wholesale E-Commerce Platform with Automated WhatsApp Notification**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2B%20Fallback-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28.svg?logo=firebase)](https://firebase.google.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Automated%20Receipt-25D366.svg?logo=whatsapp)](https://wa.me/8801000000000)

---

## 📋 Table of Contents
- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Default Admin Credentials](#-default-admin-credentials)
- [WhatsApp Automation](#-whatsapp-automation)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
  - [cPanel (Passenger)](#cpanel-passenger-deployment)
  - [Vercel (Serverless)](#vercel-serverless-deployment)
- [Contributing & License](#-license)

---

## 🌟 About The Project

**Fordoportro 3.0 (ফর্দপত্র)** is a modern, high-performance, full-stack grocery and wholesale e-commerce solution tailored for the Bangladeshi market. It provides a lightning-fast shopping experience for retail consumers and wholesale buyers with automated Bengali WhatsApp invoice generation, rich product categorization, multi-role employee & order management, and a robust offline-capable storage engine.

---

## 🚀 Key Features

### 🛒 Customer Storefront
- **Instant Product Browsing:** Fast category filters, live keyword search, dynamic price calculations, and stock indicators (In Stock, Low Stock, Wholesale Only).
- **Interactive Cart & Drawer:** Real-time quantity adjustment, wholesale minimum quantity alerts, and live subtotal/grand total calculations.
- **Customer Wishlist:** Save favorite groceries with quick "Move to Cart" action.
- **Flexible Checkout:**
  - Cash on Delivery (COD) & Manual Mobile Banking (bKash, Nagad, Rocket).
  - Bengali & English address support with delivery notes.
  - Interactive celebration confetti and instant order tracking ID upon placement.
- **Customer Dashboard:** Order tracking, order status updates (*Pending, Confirmed, Processing, Shipped, Delivered, Cancelled*), and profile management.
- **Firebase Authentication:** Secure customer login using Google Sign-In or Email/Password.

### 📱 Automated WhatsApp Integration
- **Immediate Invoice Formatting:** Every order immediately generates a structured, human-readable Bengali receipt.
- **One-Click Dispatch:** Direct `wa.me` instant messaging links for both customer and store hotline (`01000000000`).
- **Webhook & Cloud API Ready:** Plug-and-play support for WhatsApp Business API / UltraMsg / Twilio webhooks.

### 🛡️ Enterprise Admin & Staff Dashboard
- **Route:** `#/admin`
- **Role-Based Access Control (RBAC):** Supports `super_admin`, `admin`, `manager`, and `staff`.
- **Analytics Overview:** Total sales revenue, gross order numbers, active customer counts, and low-inventory warnings.
- **Product Management:** Add, edit, bulk upload, set regular vs discount prices, manage wholesale bulk minimum limits, and upload imagery.
- **Order Management:** Filter by fulfillment status, inspect order details, update delivery stages, and print invoices.
- **Category Control:** Create, sort, and manage store departments and icons.
- **Employee Management:** Add team members with distinct permission tiers and activation toggles.

### ⚡ Resilient Database Architecture
- Direct connection to **MongoDB Atlas Cluster**.
- **Auto-Fallback Engine:** If MongoDB Atlas encounters network or IP whitelist restrictions (SSL Alert 80), the system automatically activates a local JSON persistent storage engine (`LocalMongoDB`), guaranteeing **zero downtime** for both store and admin panel.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Icons:** Lucide React
- **Animations:** Canvas Confetti & Modern CSS micro-interactions
- **Authentication:** Firebase Auth v10
- **Routing:** Hash-based SPA router with persistent state caching

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4
- **Database:** MongoDB 6 Driver (Atlas) + Local Persistent Storage Fallback
- **Security:** SHA-256 with custom salt hashing, CORS configuration, payload limits
- **Concurrency:** `concurrently` for unified development workflow

---

## 📂 Project Architecture

```plaintext
Fordoportro3.0/
├── client/                     # React frontend (Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Navbar, CartDrawer, WishlistDrawer, Footer, etc.
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # Storefront (HomePage, ShopPage, CheckoutPage, etc.)
│   │   │   └── admin/          # Admin pages (Dashboard, Groceries, Orders, Employees)
│   │   ├── firebase.js         # Firebase client configuration
│   │   ├── App.jsx             # Main router & layout controller
│   │   └── index.css           # Styling and design system
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js backend
│   ├── config/
│   │   └── db.js               # MongoDB connection + Local persistent fallback
│   ├── data/                   # Fallback JSON storage directory
│   ├── routes/                 # Express API route modules
│   │   ├── auth.js             # Admin & customer authentication
│   │   ├── products.js         # Product CRUD & stock operations
│   │   ├── categories.js       # Category management
│   │   ├── orders.js           # Order placement & fulfillment
│   │   ├── employees.js        # Employee & staff management
│   │   ├── wishlist.js         # Wishlist endpoints
│   │   └── admin.js            # Admin analytics & system statistics
│   ├── services/
│   │   └── whatsapp.js         # WhatsApp notification & receipt builder
│   └── index.js                # Standalone Express runner
│
├── api/                        # Vercel serverless entrypoint
│   └── index.js
├── app.js                      # cPanel Passenger entrypoint
├── package.json                # Root package configuration
├── vercel.json                 # Vercel deployment configuration
└── .env                        # Server configuration & credentials
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or later recommended)
- **npm** (v9.0.0 or later)
- (Optional) **MongoDB Atlas Account**

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/fordoportro3.0.git
   cd fordoportro3.0
   ```

2. **Install Root & Server dependencies:**
   ```bash
   npm install
   ```

3. **Install Client dependencies:**
   ```bash
   npm --prefix client install
   ```

---

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fordoportro_db?retryWrites=true&w=majority

# Super Admin Account (Auto-created on first boot)
SUPER_ADMIN_EMAIL=admin@fordoportro.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_SECRET=fordo_super_secret_2026

# WhatsApp & Contact Integration
WHATSAPP_BUSINESS_NUMBER=01000000000
FACEBOOK_PAGE_URL="Your FB Page Link"

# Optional: WhatsApp Cloud API / Webhook Integration
# WHATSAPP_API_URL=https://api.provider.com/send
# WHATSAPP_API_KEY=your_api_token

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

### Running the App

#### 1. Full-Stack Development (Concurrent)
Runs both the Express API server and the Vite React frontend with a single command:
```bash
npm run dev
```
- **Storefront / App:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

#### 2. Running Parts Individually
- **Server only:**
  ```bash
  npm run server
  ```
- **Client only:**
  ```bash
  npm run client
  ```

#### 3. Building for Production
```bash
npm run build
```
This builds the optimized frontend bundle into `client/dist/`, which is automatically served by `app.js` or `server/index.js`.

---

## 🔑 Default Admin Credentials

When the backend starts for the first time, it automatically verifies and provisions the Super Admin account:

- **Admin URL:** `http://localhost:5173/#/admin`
- **Email:** `admin@fordoportro.com`
- **Password:** `admin123`

> 💡 *Note: You can change the initial email and password via `.env` or from within the **Employees** tab in the admin panel.*

---

## 📱 WhatsApp Automation

Whenever an order is placed:
1. An itemized invoice in Bengali is constructed containing:
   - Order ID & Dhaka timestamp
   - Customer name, phone number, and delivery address
   - Items list with unit price and quantities
   - Subtotal, discounts, delivery method, and grand total
2. The server outputs direct **Click-to-Chat WhatsApp links** for the business operator and customer.
3. If `WHATSAPP_API_URL` and `WHATSAPP_API_KEY` are provided, it dispatches an automated HTTP payload directly to your messaging gateway.

---

## 📡 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status & hotline check |
| `GET` | `/api/products` | Retrieve all active grocery products |
| `POST` | `/api/products` | Create a new product (Admin) |
| `PUT` | `/api/products/:id` | Update product details or stock (Admin) |
| `DELETE` | `/api/products/:id` | Delete a product (Admin) |
| `GET` | `/api/categories` | Retrieve all grocery categories |
| `POST` | `/api/categories` | Create / update categories (Admin) |
| `POST` | `/api/orders` | Place a new order (Triggers WhatsApp) |
| `GET` | `/api/orders` | List orders (Admin / filtered by user) |
| `PUT` | `/api/orders/:id/status` | Update fulfillment status (Admin) |
| `POST` | `/api/auth/admin-login` | Admin role-restricted authentication |
| `GET` | `/api/admin/stats` | Dashboard business analytics |
| `GET` | `/api/employees` | List employee roster (Admin) |
| `POST` | `/api/employees` | Create a staff member with role permissions |
| `GET` | `/api/wishlist/:userId` | Get customer wishlist items |
| `POST` | `/api/wishlist/toggle` | Toggle item in customer wishlist |

---

## 🌐 Deployment

### cPanel (Passenger Deployment)
The root `app.js` file is tailored specifically for **cPanel "Setup Node.js App" (Phusion Passenger)**:
1. Build the frontend (`npm run build`).
2. Upload the project files to your cPanel hosting directory (excluding `node_modules`).
3. In cPanel **Setup Node.js App**:
   - **Node.js version:** Select `18.x` or `20.x`.
   - **Application root:** `/` (or your folder path).
   - **Application startup file:** `app.js`.
4. Run `npm install` inside the cPanel interface.
5. Restart the application.

### Vercel (Serverless Deployment)
The repository includes pre-configured `vercel.json` and `api/index.js`:
1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set your environment variables in the Vercel project dashboard.
4. Deploy — Vercel handles serverless routing for `/api` and hosts the static React bundle.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

Developed for **ফর্দপত্র (Fordoportro)** — *কম দামে সেরা বাজার!*  
Hotline & WhatsApp: **01000000000** | [Facebook Page](https://www.facebook.com/share/1DaCe5HSkF/)
