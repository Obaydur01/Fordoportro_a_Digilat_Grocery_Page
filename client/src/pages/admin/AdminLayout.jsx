import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Tags,
  Users,
  Store,
  ShieldCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ activeTab, setActiveTab, onExitAdmin, onAdminLogout, children }) {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              ফ
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                Fordoportro
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.5px' }}>
                ADMIN CONTROL PANEL
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="admin-mobile-close-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`admin-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>ড্যাশবোর্ড (Dashboard)</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`admin-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>অর্ডার দেখুন (Orders)</span>
          </button>

          <button
            onClick={() => handleTabChange('groceries')}
            className={`admin-nav-link ${activeTab === 'groceries' ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>মুদি পণ্য (Groceries)</span>
          </button>

          <button
            onClick={() => handleTabChange('categories')}
            className={`admin-nav-link ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <Tags size={18} />
            <span>ক্যাটাগরি (Categories)</span>
          </button>

          <button
            onClick={() => handleTabChange('employees')}
            className={`admin-nav-link ${activeTab === 'employees' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>কর্মচারী (Employees)</span>
          </button>
        </nav>

        {/* Bottom Storefront & Logout button */}
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={onExitAdmin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#38bdf8',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}
          >
            <Store size={16} />
            <span>গ্রাহক স্টোরে ফিরুন</span>
          </button>

          <button
            onClick={() => {
              if (onAdminLogout) onAdminLogout();
              onExitAdmin();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.85rem'
            }}
          >
            <LogOut size={16} />
            <span>অ্যাডমিন লগআউট (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="admin-menu-toggle-btn"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <ShieldCheck size={22} color="var(--primary)" className="admin-header-shield" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {activeTab === 'dashboard' && 'অ্যাডমিন ড্যাশবোর্ড ও বিশ্লেষণ'}
              {activeTab === 'orders' && 'অর্ডারসমূহ ব্যবস্থাপনা'}
              {activeTab === 'groceries' && 'মুদি পণ্য ব্যবস্থাপনা'}
              {activeTab === 'categories' && 'ক্যাটাগরি ব্যবস্থাপনা'}
              {activeTab === 'employees' && 'কর্মচারী ও কর্মকর্তা ব্যবস্থাপনা'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="admin-topbar-hotline">
              হটলাইন: 01327226437
            </div>

            <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
              {currentUser?.displayName || 'Admin'}
            </div>
          </div>
        </header>

        <main className="admin-main-view">
          {children}
        </main>
      </div>
    </div>
  );
}
