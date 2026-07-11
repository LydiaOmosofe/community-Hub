import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#084D68';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const inputBg = darkMode ? '#0f172a' : '#fff';
  const inputBorder = darkMode ? '#334155' : '#e5e7eb';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await forgotPassword(email); setSent(true); }
    catch {} finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '2rem', transition: 'background .3s' }}>
      <div style={{ width: '100%', maxWidth: 400, background: cardBg, borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(10,107,142,.08)', border: `0.5px solid ${cardBorder}`, transition: 'background .3s' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: textPrimary }}>Reset your password</h2>
        {sent ? (
          <p style={{ fontSize: 14, color: '#16a34a', marginTop: 16 }}>✅ Reset link sent! Check your inbox.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: textSecondary, marginBottom: '1.5rem' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={submit}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: `1.5px solid ${inputBorder}`, fontSize: 14, boxSizing: 'border-box', marginBottom: 16, background: inputBg, color: textPrimary, outline: 'none' }} />
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: 9, border: 'none', background: loading ? '#9ca3af' : '#0A6B8E', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ fontSize: 13, color: '#0A6B8E', textDecoration: 'none', fontWeight: 600 }}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}