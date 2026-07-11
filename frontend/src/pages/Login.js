import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const inputBorder = darkMode ? '#334155' : '#e5e7eb';

  const handle = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: `1.5px solid ${inputBorder}`, fontSize: 14,
    boxSizing: 'border-box', background: inputBg, color: textPrimary,
    outline: 'none', transition: 'border .15s, background .3s'
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await loginUser(form);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '2rem', transition: 'background .3s' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/SEGILOGO.png" alt="SEGi" style={{ height: 56, objectFit: 'contain', marginBottom: 12 }} onError={e => e.target.style.display = 'none'} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#084D68', margin: 0 }}>SEGi Community Hub</h1>
          <p style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: cardBg, borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(10,107,142,.08)', border: `0.5px solid ${cardBorder}`, transition: 'background .3s' }}>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}

          <form onSubmit={submit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Email address</label>
              <input type="email" value={form.email} onChange={handle('email')} required placeholder="you@gmail.com"
                style={inp}
                onFocus={e => e.target.style.borderColor = '#0A6B8E'}
                onBlur={e => e.target.style.borderColor = inputBorder} />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={handle('password')} required placeholder="Enter your password"
                  style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#0A6B8E'}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
                <span onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#0A6B8E', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 9, border: 'none',
              background: loading ? '#9ca3af' : '#0A6B8E', color: '#fff',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: '.15s'
            }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: textSecondary, marginTop: '1.25rem' }}>
            New here? <Link to="/register" style={{ color: '#0A6B8E', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}