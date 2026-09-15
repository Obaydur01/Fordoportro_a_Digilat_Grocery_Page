import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import ProductDetailModal from './components/ProductDetailModal';

// Storefront Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import CustomerDashboard from './pages/CustomerDashboard';
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminGroceries from './pages/admin/AdminGroceries';
import AdminCategories from './pages/admin/AdminCategories';
import AdminEmployees from './pages/admin/AdminEmployees';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Helper to parse URL hash or fallback to localStorage
function parseRouteFromHash() {
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  
  if (!rawHash) {
    const savedView = localStorage.getItem('fp_current_view') || 'home';
    const savedAdminTab = localStorage.getItem('fp_admin_tab') || 'dashboard';
    const savedCategory = localStorage.getItem('fp_selected_category') || 'all';
    return { view: savedView, adminTab: savedAdminTab, category: savedCategory };
  }

  const [pathPart, queryPart] = rawHash.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const rootSegment = segments[0] || 'home';

  const params = new URLSearchParams(queryPart || '');
  const categoryParam = params.get('category') || localStorage.getItem('fp_selected_category') || 'all';

  if (rootSegment === 'admin') {
    const tab = segments[1] || localStorage.getItem('fp_admin_tab') || 'dashboard';
    return { view: 'admin', adminTab: tab, category: categoryParam };
  }

  if (['shop', 'checkout', 'dashboard', 'login', 'success', 'home'].includes(rootSegment)) {
    return {
      view: rootSegment,
      adminTab: localStorage.getItem('fp_admin_tab') || 'dashboard',
      category: categoryParam
    };
  }

  return { view: 'home', adminTab: 'dashboard', category: 'all' };
}

// Helper to sync route to URL hash & localStorage
function syncRouteToUrl(view, adminTab, category) {
  let targetHash = '#/';
  if (view === 'admin') {
    targetHash = adminTab && adminTab !== 'dashboard' ? `#/admin/${adminTab}` : '#/admin';
  } else if (view === 'shop') {
    targetHash = category && category !== 'all' ? `#/shop?category=${encodeURIComponent(category)}` : '#/shop';
  } else if (view === 'home') {
    targetHash = '#/';
  } else {
    targetHash = `#/${view}`;
  }

  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }

  try {
    localStorage.setItem('fp_current_view', view);
    if (view === 'admin' && adminTab) {
      localStorage.setItem('fp_admin_tab', adminTab);
    }
    if (category) {
      localStorage.setItem('fp_selected_category', category);
    }
  } catch (e) {}
}

function MainApp() {
  const initialRoute = parseRouteFromHash();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [adminTab, setAdminTab] = useState(initialRoute.adminTab);
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.category);
  const [searchQuery, setSearchQuery] = useState('');

  // Strict Admin Session (Persistent across refresh & tabs)
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_admin_session') || sessionStorage.getItem('fp_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Cached Catalog State (Loads immediately with zero blank delay on refresh)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_cached_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Categories always loaded fresh from MongoDB — no localStorage cache
  const [categories, setCategories] = useState([]);

  const [loadingCatalog, setLoadingCatalog] = useState(products.length === 0);

  // Active modal product
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Completed Order State for Success Screen (persisted across refresh)
  const [lastPlacedOrder, setLastPlacedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [lastWhatsAppInfo, setLastWhatsAppInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_last_whatsapp');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const { currentUser } = useAuth();
  const { setIsCartOpen } = useCart();

  // Load Catalog from backend & refresh local cache
  const loadCatalog = useCallback(() => {
    Promise.all([
      fetch('/api/products?limit=1000').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([prodData, catData]) => {
        if (prodData.success && prodData.products) {
          setProducts(prodData.products);
          try {
            localStorage.setItem('fp_cached_products', JSON.stringify(prodData.products));
          } catch (e) {}
        }
        if (catData.success && catData.categories) {
          // Always set from MongoDB — no local cache write
          setCategories(catData.categories);
        }
        setLoadingCatalog(false);
      })
      .catch(err => {
        console.error("Error loading catalog:", err);
        setLoadingCatalog(false);
      });
  }, []);

  // Sync route and hash listeners
  useEffect(() => {
    // Clear any old cached categories — always read from MongoDB only
    try { localStorage.removeItem('fp_cached_categories'); } catch (e) {}
    loadCatalog();

    // Ensure URL hash matches initial state if user opened naked URL
    if (!window.location.hash) {
      syncRouteToUrl(initialRoute.view, initialRoute.adminTab, initialRoute.category);
    }

    const handleHashChange = () => {
      const route = parseRouteFromHash();
      setCurrentView(route.view);
      if (route.adminTab) setAdminTab(route.adminTab);
      if (route.category) setSelectedCategory(route.category);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadCatalog, initialRoute.view, initialRoute.adminTab, initialRoute.category]);

  const handleNavigate = (view, options = {}) => {
    const nextCat = options.selectedCategory || (view === 'shop' ? selectedCategory : 'all');
    setCurrentView(view);
    if (options.selectedCategory) {
      setSelectedCategory(options.selectedCategory);
    }
    syncRouteToUrl(view, adminTab, nextCat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminTabChange = (tab) => {
    setAdminTab(tab);
    syncRouteToUrl('admin', tab, selectedCategory);
  };

  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    if (currentView !== 'shop') {
      setCurrentView('shop');
    }
    syncRouteToUrl('shop', adminTab, catSlug);
  };

  const handleAdminLoginSuccess = (session) => {
    try {
      localStorage.setItem('fp_admin_session', JSON.stringify(session));
      sessionStorage.setItem('fp_admin_session', JSON.stringify(session));
    } catch (e) {}
    setAdminSession(session);
    syncRouteToUrl('admin', adminTab, selectedCategory);
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('fp_admin_session');
      sessionStorage.removeItem('fp_admin_session');
    } catch (e) {}
    setAdminSession(null);
    setCurrentView('home');
    syncRouteToUrl('home', 'dashboard', 'all');
  };

  const handleOrderSuccess = (order, whatsapp) => {
    setLastPlacedOrder(order);
    setLastWhatsAppInfo(whatsapp);
    try {
      localStorage.setItem('fp_last_order', JSON.stringify(order));
      localStorage.setItem('fp_last_whatsapp', JSON.stringify(whatsapp));
    } catch (e) {}
    setCurrentView('success');
    syncRouteToUrl('success', adminTab, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Mode, check authentication (NO auto-login)
  if (currentView === 'admin') {
    if (!adminSession) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToStore={() => handleNavigate('home')}
        />
      );
    }

    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={handleAdminTabChange}
        onExitAdmin={() => handleNavigate('home')}
        onAdminLogout={handleAdminLogout}
      >
        {adminTab === 'dashboard' && <AdminDashboard onSwitchTab={handleAdminTabChange} />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'groceries' && (
          <AdminGroceries
            categories={categories}
            onRefreshProducts={loadCatalog}
          />
        )}
        {adminTab === 'categories' && (
          <AdminCategories
            categories={categories}
            onRefreshCategories={loadCatalog}
          />
        )}
        {adminTab === 'employees' && <AdminEmployees />}
      </AdminLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Hotline Bar & Sticky Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Category Pills Bar (shown on home & shop views) */}
      {(currentView === 'home' || currentView === 'shop') && (
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            onNavigate={handleNavigate}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onBackToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'success' && (
          <OrderSuccess
            order={lastPlacedOrder}
            whatsappData={lastWhatsAppInfo}
            onGoHome={() => handleNavigate('home')}
            onTrackOrder={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          currentUser ? (
            <CustomerDashboard onNavigate={handleNavigate} />
          ) : (
            <LoginPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Slide-out Drawers */}
      <CartDrawer onCheckout={() => handleNavigate('checkout')} />
      <WishlistDrawer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
