import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handle = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
    outline: 'none', transition: 'border .15s', fontFamily: 'inherit'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #084D68 0%, #0A6B8E 50%, #0d8aad 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', bottom:-60, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

      <div style={{ height: 44 }} />

        <div style={{ position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            Join the<br />
            <span style={{ color: '#7dd3f0' }}>SEGi Community</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
            Create your account and start discovering clubs, events, and everything campus life has to offer.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Discover and join campus clubs', 'Stay updated on upcoming events', 'Get AI-powered campus assistance', 'Receive notifications from clubs'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, position: 'relative' }}>
          © 2026 SEGi University · Kota Damansara
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', background: '#fff' }}>
        <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>

          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: '#084D68' }}>Create account</h2>
          <p style={{ margin: '0 0 2rem', fontSize: 14, color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0A6B8E', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPwd ? (show ? 'text' : 'password') : type}
          value={form[key]} onChange={handle(key)} required
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: isPwd ? 40 : 14 }}
          onFocus={e => e.target.style.borderColor = '#0A6B8E'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
              width: '100%', padding: '12px', borderRadius: 9, border: 'none', marginTop: 8,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #084D68, #0A6B8E)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: '1.5rem', lineHeight: 1.6 }}>
            By signing up you agree to the SEGi Community Hub terms of use.
          </p>
        </div>
      </div>
    </div>
  );
}
