import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Phone, Mail, ShieldCheck, Key, X, Lock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminEmployees() {
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedAdminForReset, setSelectedAdminForReset] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Get current admin session
  const adminSession = (() => {
    try {
      return JSON.parse(localStorage.getItem('fp_admin_session') || sessionStorage.getItem('fp_admin_session')) || {};
    } catch (e) {
      return {};
    }
  })();

  const isSuperAdmin = adminSession.isSuperAdmin || adminSession.role === 'super_admin';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAdmins = () => {
    setLoading(true);
    fetch('/api/auth/admins')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.admins) {
          setAdminsList(data.admins);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isSuperAdmin) {
      setError('শুধুমাত্র সুপার অ্যাডমিন নতুন অ্যাডমিন তৈরি করতে পারেন');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('নাম, ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorRole: adminSession.role || 'super_admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setFormData({ name: '', email: '', phone: '', role: 'admin', password: '' });
        fetchAdmins();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setError(data.message || 'অ্যাডমিন তৈরি ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setError('সার্ভার এরর');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedAdminForReset || !newPasswordInput || newPasswordInput.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      const res = await fetch(`/api/auth/admins/${selectedAdminForReset._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPasswordInput,
          creatorRole: adminSession.role || 'super_admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setIsResetPasswordModalOpen(false);
        setNewPasswordInput('');
        setSelectedAdminForReset(null);
      } else {
        alert(data.message || 'ব্যর্থ হয়েছে');
      }
    } catch (e) {
      alert('সার্ভার সমস্যা');
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.role === 'super_admin') {
      alert('প্রধান সুপার অ্যাডমিন একাউন্ট ডিলিট করা সম্ভব নয়!');
      return;
    }

    if (!window.confirm(`আপনি কি নিশ্চিত "${admin.name}" এর অ্যাডমিন অ্যাক্সেস বাতিল করতে চান?`)) return;

    try {
      const res = await fetch(`/api/auth/admins/${admin._id}?creatorRole=${adminSession.role || 'super_admin'}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      } else {
        alert(data.message || 'ডিলিট ব্যর্থ হয়েছে');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return '👑 সুপার অ্যাডমিন (Super Admin)';
      case 'admin': return '🛡️ অ্যাডমিন (Admin)';
      case 'manager': return '📦 স্টোর ম্যানেজার (Store Manager)';
      case 'dispatcher': return '📋 অর্ডার প্রস্তুতকারক (Dispatcher)';
      case 'delivery': return '🛵 ডেলিভারি বয় (Delivery Staff)';
      default: return role;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              অ্যাডমিন ও রোল ম্যানেজমেন্ট (Admin & Staff Access)
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {isSuperAdmin ? (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>
                ✓ আপনি সুপার অ্যাডমিন হিসেবে লগইন রয়েছেন। আপনি নতুন অ্যাডমিন তৈরি ও পাসওয়ার্ড সেট করতে পারবেন।
              </span>
            ) : (
              <span>অনুমোদিত অ্যাডমিনদের তালিকা ও পারমিশন কন্ট্রোল</span>
            )}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>নতুন অ্যাডমিন / রোল তৈরি করুন</span>
          </button>
        )}
      </div>

      {/* Admins Table */}
      <div className="admin-table-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.95rem' }}>
          অনুমোদিত অ্যাডমিন ও কর্মকর্তা তালিকা ({adminsList.length})
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>অ্যাডমিন তালিকা লোড হচ্ছে...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অ্যাডমিন নাম</th>
                  <th>লগইন ইমেইল</th>
                  <th>মোবাইল নম্বর</th>
                  <th>বরাদ্দকৃত রোল (Role)</th>
                  <th>স্ট্যাটাস</th>
                  <th>তৈরির তারিখ</th>
                  {isSuperAdmin && <th>পাসওয়ার্ড ও নিরাপত্তা</th>}
                </tr>
              </thead>
              <tbody>
                {adminsList.map((adm) => (
                  <tr key={adm._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{adm.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-en)' }}>
                        <Mail size={13} color="#64748b" />
                        <span>{adm.email}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{adm.phone || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        adm.role === 'super_admin' ? 'badge-hot' :
                        adm.role === 'admin' ? 'badge-success' : 'badge-info'
                      }`}>
                        {getRoleLabel(adm.role)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">সক্রিয় (Active)</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('bn-BD') : 'System'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAdminForReset(adm);
                              setNewPasswordInput('');
                              setIsResetPasswordModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            title="পাসওয়ার্ড পরিবর্তন করুন"
                          >
                            <Key size={13} />
                            <span>পাসওয়ার্ড সেট</span>
                          </button>

                          {adm.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(adm)}
                              className="btn btn-sm"
                              style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.78rem' }}
                              title="অ্যাডমিন বাতিল করুন"
                            >
                              <Trash2 size={13} />
                              <span>বাতিল</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create New Admin & Set Role/Password (Super Admin Only) */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                নতুন অ্যাডমিন তৈরি ও পাসওয়ার্ড নির্ধারণ
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin}>
              <div className="modal-body">
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  color: '#15803d'
                }}>
                  👑 <strong>সুপার অ্যাডমিন সুবিধা:</strong> আপনি এখানে যে ইমেইল ও পাসওয়ার্ড দেবেন, শুধুমাত্র সেই তথ্য ব্যবহার করেই তিনি অ্যাডমিন প্যানেলে লগইন করতে পারবেন। সাধারণ গ্রাহকরা এই প্যানেলে প্রবেশ করতে পারবে না।
                </div>

                {error && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    {successMsg}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">অ্যাডমিন / কর্মকর্তার পূর্ণ নাম *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="যেমন: মোঃ কামরুল ইসলাম"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">অফিসিয়াল লগইন ইমেইল *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="manager@fordoportro.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">বরাদ্দকৃত পদবী (Role) *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="admin">Admin (পূর্ণ অ্যাডমিন)</option>
                      <option value="manager">Store Manager (স্টোর ম্যানেজার)</option>
                      <option value="dispatcher">Order Dispatcher (অর্ডার প্রস্তুতকারক)</option>
                      <option value="delivery">Delivery Staff (ডেলিভারি বয়)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">লগইন পাসওয়ার্ড সেট করুন *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    এই পাসওয়ার্ডটি ব্যবহার করে তিনি অ্যাডমিন প্যানেলে লগইন করবেন।
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  অ্যাডমিন তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reset Admin Password (Super Admin Only) */}
      {isResetPasswordModalOpen && selectedAdminForReset && (
        <div className="modal-backdrop" onClick={() => setIsResetPasswordModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>পাসওয়ার্ড রিসেট</h3>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="drawer-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                  <strong>{selectedAdminForReset.name}</strong> ({selectedAdminForReset.email}) এর জন্য নতুন পাসওয়ার্ড দিন:
                </p>

                <div className="form-group">
                  <label className="form-label">নতুন পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="কমপক্ষে ৬ ডিজিটের নতুন পাসওয়ার্ড"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsResetPasswordModalOpen(false)} className="btn btn-secondary btn-sm">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  পাসওয়ার্ড পরিবর্তন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
