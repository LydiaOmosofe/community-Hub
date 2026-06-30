import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const SEGiLogo = () => (
  <img 
    src="/SEGILOGO.png" 
    alt="SEGi University" 
    style={{ width: 38, height: 38, objectFit: 'contain' }}
    onError={e => e.target.style.display='none'} 
  />
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [hovered, setHovered] = useState(null);

  const getRole = () => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])).role; }
    catch { return null; }
  };

  const role = getRole();
  const isAdmin = role === 'systemAdmin' || role === 'clubAdmin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/events', label: 'Events' },
    { to: '/chatbot', label: 'Hub Assistant' },
    { to: '/notifications', label: 'Notifications' },
  ];

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav style={{
      background: '#0A6B8E', height: 66,
      display: 'flex', alignItems: 'center', padding: '0 2.5rem',
      position: 'sticky', top: 0, zIndex: 100,
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: '2rem', flexShrink: 0 }}>
        <SEGiLogo />
        <div>
          <b style={{ color: '#fff', fontSize: 14, fontWeight: 500, display: 'block' }}>SEGi University</b>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 11 }}>Community Hub</span>
        </div>
      </Link>

      <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.2)', marginRight: '1.5rem', flexShrink: 0 }} />

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {links.map(({ to, label }) => (
          <Link key={to} to={to}
            onMouseEnter={() => setHovered(to)}
            onMouseLeave={() => setHovered(null)}
            style={{
              color: isActive(to) ? '#fff' : 'rgba(255,255,255,.82)',
              textDecoration: 'none', fontSize: 13.5,
              padding: '7px 14px', borderRadius: 6, transition: '.15s',
              fontWeight: isActive(to) ? 500 : 400,
              background: isActive(to) ? 'rgba(255,255,255,.18)' : hovered === to ? 'rgba(255,255,255,.12)' : 'transparent'
            }}>{label}</Link>
        ))}
        {token && isAdmin && (
          <Link to="/admin"
            onMouseEnter={() => setHovered('admin')}
            onMouseLeave={() => setHovered(null)}
            style={{
              color: isActive('/admin') ? '#fff' : 'rgba(255,255,255,.82)',
              textDecoration: 'none', fontSize: 13.5,
              padding: '7px 14px', borderRadius: 6, transition: '.15s',
              fontWeight: isActive('/admin') ? 500 : 400,
              background: isActive('/admin') ? 'rgba(255,255,255,.18)' : hovered === 'admin' ? 'rgba(255,255,255,.12)' : 'transparent'
            }}> Admin</Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: '1rem', alignItems: 'center' }}>
        {token ? (
          <>
            <span style={{ color: '#7dd3f0', fontSize: 13.5, fontWeight: 500 }}>Hi, {user.name}!</span>
            <button onClick={handleLogout} style={{
              border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent',
              color: '#fff', padding: '7px 18px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: 'pointer'
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent',
              color: '#fff', padding: '7px 18px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none'
            }}>Login</Link>
            <Link to="/register" style={{
              background: '#fff', color: '#0A6B8E', border: 'none',
              padding: '7px 18px', borderRadius: 8, fontSize: 13,
              fontWeight: 500, cursor: 'pointer', textDecoration: 'none'
            }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
