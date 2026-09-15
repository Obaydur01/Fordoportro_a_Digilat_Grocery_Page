import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Search, MessageSquare, Eye, CheckCircle, RefreshCw, Printer, X } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    let url = '/api/orders?limit=100';
    if (statusFilter !== 'all') url += `&status=${statusFilter}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q)
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>অর্ডার ব্যবস্থাপনা (Order Management)</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            মোট অর্ডার: <strong>{filteredOrders.length}</strong> টি
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                background: statusFilter === st ? 'var(--primary)' : '#f1f5f9',
                color: statusFilter === st ? 'white' : '#475569',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              {st === 'all' ? 'সব অর্ডার' : st}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>লোড হচ্ছে...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            কোনো অর্ডার পাওয়া যায়নি
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অর্ডার আইডি</th>
                  <th>তারিখ</th>
                  <th>গ্রাহকের তথ্য</th>
                  <th>ঠিকানা</th>
                  <th>আইটেম</th>
                  <th>মোট বিল</th>
                  <th>পেমেন্ট</th>
                  <th>স্ট্যাটাস আপডেট</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customerWaLink = `https://wa.me/8801327226437?text=${encodeURIComponent(
                    `হ্যালো ${order.customerName}, ফর্দপত্র থেকে আপনার অর্ডার #${order.orderNumber} এর বিষয়ে যোগাযোগ করা হচ্ছে। স্ট্যাটাস: ${order.status}`
                  )}`;

                  return (
                    <tr key={order._id || order.orderNumber}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-en)' }}>#{order.orderNumber}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.shippingAddress}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {order.items?.length || 0} টি
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-en)' }}>
                          ৳{order.grandTotal}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem' }}>{order.paymentMethod?.split(' ')[0]}</span>
                      </td>
                      <td>
                        {/* Interactive Status Selector */}
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="form-control"
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            background:
                              order.status === 'Delivered' ? '#dcfce7' :
                                order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7'
                          }}
                        >
                          <option value="Pending">Pending (অপেক্ষমান)</option>
                          <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                          <option value="Processing">Processing (প্যাকিং)</option>
                          <option value="Out for Delivery">Out for Delivery (ডেলিভারিতে)</option>
                          <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                          <option value="Cancelled">Cancelled (বাতিল)</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="ইনভয়েস দেখুন"
                          >
                            <Eye size={14} />
                          </button>

                          <a
                            href={customerWaLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                          >
                            <MessageSquare size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                অর্ডার ইনভয়েস - #{selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" id="invoice-print-area">
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: 800 }}>ফর্দপত্র (Fordoportro)</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>কম দামে পাইকারি ও খুচরা বাজার • হটলাইন: 01327226437</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <div>
                  <strong>গ্রাহকের তথ্য:</strong>
                  <div>নাম: {selectedOrder.customerName}</div>
                  <div>ফোন: {selectedOrder.customerPhone}</div>
                  <div>ঠিকানা: {selectedOrder.shippingAddress}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>তারিখ:</strong> {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}</div>
                  <div><strong>পেমেন্ট:</strong> {selectedOrder.paymentMethod}</div>
                  <div><strong>স্ট্যাটাস:</strong> {selectedOrder.status}</div>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>পণ্য</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>পরিমাণ</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>দর (৳)</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>মোট (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem' }}>{it.name} ({it.unit})</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>৳{it.price}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>৳{(it.price || 0) * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <div>সাবটোটাল: <strong>৳{selectedOrder.subtotal}</strong></div>

                {selectedOrder.discountAmount > 0 && (
                  <div>ডিসকাউন্ট: <strong>-৳{selectedOrder.discountAmount}</strong></div>
                )}
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  সর্বমোট বিল: ৳{selectedOrder.grandTotal}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={16} />
                <span>প্রিন্ট ইনভয়েস</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-primary btn-sm"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
