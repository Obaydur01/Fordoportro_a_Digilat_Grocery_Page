import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const {
    login,
    signup,
    loginWithGoogle,
    demoLoginAdmin,
    demoLoginCustomer1,
    demoLoginCustomer2
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      onNavigate('home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'অথেন্টিকেশনে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fp-container" style={{ padding: '3.5rem 1.25rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <User size={28} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            {isRegister ? 'ফর্দপত্রে অ্যাকাউন্ট তৈরি করুন' : 'ফর্দপত্রে লগইন করুন'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Firebase প্রমাণীকরণ ও সুরক্ষিত ডেটাবেস
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">আপনার পূর্ণ নাম</label>
              <input
                type="text"
                className="form-control"
                placeholder="যেমন: মোঃ জাহিদ হাসান"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ইমেইল ঠিকানা</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড</label>
            <input
              type="password"
              className="form-control"
              placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? 'প্রসেস হচ্ছে...' : isRegister ? 'নিবন্ধন করুন' : 'লগইন করুন'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b', marginBottom: '1.75rem' }}>
          {isRegister ? (
            <span>
              ইতিমধ্যেই অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                এখানে লগইন করুন
              </button>
            </span>
          ) : (
            <span>
              নতুন গ্রাহক?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ color: 'var(--primary)', fontWeight: 700 }}
              >
                নতুন অ্যাকাউন্ট খুলুন
              </button>
            </span>
          )}
        </div>

        {/* Demo 1-Click Instant Login Box */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>১-ক্লিকে তাৎক্ষণিক ডেমো লগইন</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => {
                demoLoginCustomer1();
                onNavigate('dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, fontSize: '0.82rem' }}
            >
              👤 গ্রাহক ১ (রাকিবুল)
            </button>

            <button
              type="button"
              onClick={() => {
                demoLoginCustomer2();
                onNavigate('dashboard');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, fontSize: '0.82rem' }}
            >
              👤 গ্রাহক ২ (সাদিয়া)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
