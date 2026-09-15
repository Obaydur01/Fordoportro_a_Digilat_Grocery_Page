import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard({ onSwitchTab }) {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>সামগ্রিক পরিসংখ্যান</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>ফর্দপত্র অনলাইন পাইকারি ও খুচরা গ্রোসারি প্ল্যাটফর্ম</p>
        </div>

        <button onClick={fetchStats} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        {/* Total Revenue */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">সর্বমোট বিক্রয় (Revenue)</div>
            <div className="stat-val" style={{ color: 'var(--primary-dark)' }}>
              ৳{stats?.totalRevenue || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>লাইভ অর্ডার থেকে গণনাকৃত</span>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <DollarSign size={26} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">মোট অর্ডার (Orders)</div>
            <div className="stat-val">{stats?.totalOrders || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>সফলভাবে সম্পন্ন</span>
          </div>
          <div className="stat-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShoppingCart size={26} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">অপেক্ষমান অর্ডার (Pending)</div>
            <div className="stat-val" style={{ color: '#d97706' }}>
              {stats?.pendingOrders || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>দ্রুত প্রসেস করুন</span>
          </div>
          <div className="stat-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={26} />
          </div>
        </div>

        {/* Total Products */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">সক্রিয় মুদি পণ্য (Groceries)</div>
            <div className="stat-val">{stats?.totalProducts || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ইনভেন্টরিতে মজুদ</span>
          </div>
          <div className="stat-icon-box" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Package size={26} />
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">স্বল্প স্টক অ্যালার্ট (Low Stock)</div>
            <div className="stat-val" style={{ color: stats?.lowStockProducts > 0 ? '#dc2626' : '#64748b' }}>
              {stats?.lowStockProducts || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>১০ এর কম স্টকযুক্ত</span>
          </div>
          <div className="stat-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={26} />
          </div>
        </div>

        {/* Total Employees */}
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">কর্মচারী ও কর্মী (Staff)</div>
            <div className="stat-val">{stats?.totalEmployees || 0}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ম্যানেজার ও ডেলিভারি বয়</span>
          </div>
          <div className="stat-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Users size={26} />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="admin-table-card" style={{ marginBottom: '2rem' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>সাম্প্রতিক অর্ডারসমূহ</h3>
          <button
            onClick={() => onSwitchTab('orders')}
            style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>সব অর্ডার দেখুন</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            কোনো অর্ডার পাওয়া যায়নি
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অর্ডার আইডি</th>
                  <th>গ্রাহকের নাম ও ফোন</th>
                  <th>পণ্যসমূহ</th>
                  <th>সর্বমোট বিল</th>
                  <th>পেমেন্ট</th>
                  <th>স্ট্যাটাস</th>
                  <th>হোয়াটসঅ্যাপ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id || order.orderNumber}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-en)' }}>#{order.orderNumber}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {order.items?.length || 0} টি পণ্য ({order.items?.[0]?.name || ''}...)
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-en)' }}>
                        ৳{order.grandTotal}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{order.paymentMethod?.split(' ')[0]}</span>
                    </td>
                    <td>
                      <span className={`badge ${order.status === 'Delivered' ? 'badge-success' :
                        order.status === 'Cancelled' ? 'badge-discount' : 'badge-warning'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/8801327226437?text=Order%20${order.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <MessageSquare size={12} />
                        <span>চ্যাট</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
