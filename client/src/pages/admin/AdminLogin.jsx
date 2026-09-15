import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('অ্যাডমিন ইমেইল ও পাসওয়ার্ড উভয়ই আবশ্যক');
      return;
    }

    setLoading(true);

    try {
      // Authenticate strictly with backend admin verification
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (data.success && data.admin) {
        const adminSession = {
          ...data.admin,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('fp_admin_session', JSON.stringify(adminSession));
        sessionStorage.setItem('fp_admin_session', JSON.stringify(adminSession));
        onLoginSuccess(adminSession);
      } else {
        setError(data.message || 'অননুমোদিত প্রবেশ! সাধারণ গ্রাহক অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশ নিষেধ।');
      }
    } catch (err) {
      console.error('Admin Auth Error:', err);
      setError('সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1d 0%, #111827 50%, #064e3b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "var(--font-bn), sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: 'white'
      }}>
        {/* Back to store */}
        <button
          type="button"
          onClick={onBackToStore}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>গ্রাহক স্টোরে ফিরে যান</span>
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(5, 150, 105, 0.4)'
          }}>
            <ShieldCheck size={36} color="white" />
          </div>

          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.35rem' }}>
            ফর্দপত্র অ্যাডমিন পোর্টাল
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            সংরক্ষিত এলাকা • সাধারণ গ্রাহকদের প্রবেশ সম্পূর্ণ নিষিদ্ধ
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            lineHeight: 1.4
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminAuth}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              অ্যাডমিন অফিসিয়াল ইমেইল *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="অ্যাডমিন ইমেইল অ্যাড্রেস"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              অ্যাডমিন সিক্রেট পাসওয়ার্ড *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="সিক্রেট পাসওয়ার্ড প্রদান করুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1.02rem', borderRadius: '12px' }}
          >
            {loading ? 'যাচাই করা হচ্ছে...' : (
              <>
                <span>সুরক্ষিত অ্যাডমিন লগইন</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Role Security Guarantee Box */}
        <div style={{
          marginTop: '1.75rem',
          padding: '0.85rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          fontSize: '0.8rem',
          color: '#cbd5e1',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#fde047', marginBottom: '0.35rem' }}>
            <KeyRound size={15} />
            <span>সুপার অ্যাডমিন সিকিউরিটি নোটিশ:</span>
          </div>
          <div>• শুধুমাত্র <strong>সুপার অ্যাডমিন</strong> প্যানেলের ভেতর থেকে নতুন অ্যাডমিন ও কর্মীদের রোল এবং পাসওয়ার্ড সেট করতে পারবেন।</div>
          <div>• সাধারণ গ্রাহকদের এখানে অ্যাকাউন্ট খোলার সুযোগ নেই।</div>
        </div>
      </div>
    </div>
  );
}
