import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
const [showPassword, setShowPassword] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await loginUser(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: '1.5px solid #e5e7eb', fontSize: 14,
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    background: '#f8fafc', transition: 'border .15s, background .15s'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/SEGILOGO.png" alt="SEGi University"
            style={{ height: 56, objectFit: 'contain', marginBottom: 12 }}
            onError={e => e.target.style.display = 'none'} />
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#084D68' }}>SEGi Community Hub</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(10,107,142,.08)', border: '0.5px solid #e5e7eb' }}>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
              <input type="email" value={form.email} onChange={handle('email')} required placeholder="you@gmail.com"
                style={inp}
                onFocus={e => { e.target.style.borderColor = '#0A6B8E'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
  <div style={{ position: 'relative' }}>
    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={handle('password')} required placeholder="Enter your password"
      style={{ ...inp, paddingRight: 40 }}
      onFocus={e => { e.target.style.borderColor = '#0A6B8E'; e.target.style.background = '#fff'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f8fafc'; }} />
    <span onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</span>
  </div>
</div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#0A6B8E', fontWeight: 500, textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 9, border: 'none',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg,#084D68,#0A6B8E)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>New here? </span>
            <Link to="/register" style={{ fontSize: 13, color: '#0A6B8E', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
