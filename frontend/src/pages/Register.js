import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const inputBorder = darkMode ? '#334155' : '#e5e7eb';

  const handle = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: `1.5px solid ${inputBorder}`, fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
    background: darkMode ? '#0f172a' : '#f8fafc',
    color: textPrimary, transition: 'border .15s, background .3s'
  };

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'background .3s' }}>

      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', minWidth: 0 }}>
        <div style={{ height: 44 }} />
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
          Join the<br /><span style={{ color: '#7dd3f0' }}>SEGi Community</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.7, marginBottom: '2rem', maxWidth: 340 }}>
          Create your account and start discovering clubs, events, and everything campus life has to offer.
        </p>
        {['Discover and join campus clubs', 'Stay updated on upcoming events', 'Get AI-powered campus assistance', 'Receive notifications from clubs'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>✓</div>
            <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, fontWeight: 500 }}>{item}</span>
          </div>
        ))}
        <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, marginTop: 'auto', paddingTop: '2rem' }}>© 2026 SEGi University · Kota Damansara</p>
      </div>

      {/* Right panel */}
      <div style={{ width: '100%', maxWidth: 480, background: cardBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 2.5rem', overflowY: 'auto', transition: 'background .3s' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, margin: '0 0 4px' }}>Create account</h2>
        <p style={{ fontSize: 13, color: textSecondary, marginBottom: '1.5rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#0A6B8E', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}

        <form onSubmit={submit}>
          {[
            { label: 'Full name', key: 'name', type: 'text', placeholder: 'e.g. Lydia Omosofe' },
            { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@segi.edu.my' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'At least 6 characters' },
            { label: 'Confirm password', key: 'confirmPassword', type: 'password', placeholder: 'Repeat your password' },
          ].map(({ label, key, type, placeholder }) => {
            const isPwd = type === 'password';
            const isConfirm = key === 'confirmPassword';
            const show = isConfirm ? showConfirmPassword : showPassword;
            const toggle = isConfirm ? () => setShowConfirmPassword(s => !s) : () => setShowPassword(s => !s);
            return (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={isPwd ? (show ? 'text' : 'password') : type}
                    value={form[key]} onChange={handle(key)} required
                    placeholder={placeholder}
                    style={{ ...inputStyle, paddingRight: isPwd ? 40 : 14 }}
                    onFocus={e => e.target.style.borderColor = '#0A6B8E'}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                  {isPwd && (
                    <span onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 9, border: 'none',
            background: loading ? '#9ca3af' : '#0A6B8E', color: '#fff',
            fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8
          }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: textSecondary, marginTop: '1rem' }}>
          By signing up you agree to the SEGi Community Hub terms of use.
        </p>
      </div>
    </div>
  );
}