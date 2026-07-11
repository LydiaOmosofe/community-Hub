import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#084D68';
  const inputBg = darkMode ? '#0f172a' : '#fff';
  const inputBorder = darkMode ? '#334155' : '#e5e7eb';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err?.response?.data?.message || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '2rem', transition: 'background .3s' }}>
      <div style={{ width: '100%', maxWidth: 400, background: cardBg, borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(10,107,142,.08)', border: `0.5px solid ${cardBorder}`, transition: 'background .3s' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: textPrimary }}>Set a new password</h2>
        {success ? (
          <p style={{ fontSize: 14, color: '#16a34a' }}>✅ Password reset! Redirecting to login…</p>
        ) : (
          <form onSubmit={submit}>
            {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input type={showPassword ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="New password (min 6 characters)"
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 9, border: `1.5px solid ${inputBorder}`, fontSize: 14, boxSizing: 'border-box', background: inputBg, color: textPrimary, outline: 'none' }} />
              <span onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: 9, border: 'none', background: loading ? '#9ca3af' : '#0A6B8E', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}