import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize';

const SEGiLogo = () => (
  <img src="/SEGILOGO.png" alt="SEGi University" style={{ width: 38, height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
    onError={e => { e.target.style.display='none'; }} />
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useWindowSize();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [hovered, setHovered] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
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
    <>
      <nav style={{
        background: '#0A6B8E', height: '4.125rem',
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2.5rem',
        position: 'sticky', top: 0, zIndex: 100,
        fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
          <SEGiLogo />
          {!isMobile && (
            <div>
              <b style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500, display: 'block' }}>SEGi University</b>
              <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.6875rem' }}>Community Hub</span>
            </div>
          )}
        </Link>

        {/* Desktop / Tablet nav links */}
        {!isMobile && (
          <>
            <div style={{ width: '1px', height: '1.875rem', background: 'rgba(255,255,255,.2)', margin: '0 1.5rem', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: isTablet ? '0.0625rem' : '0.125rem', flex: 1 }}>
              {links.map(({ to, label }) => (
                <Link key={to} to={to}
                  onMouseEnter={() => setHovered(to)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    color: isActive(to) ? '#fff' : 'rgba(255,255,255,.82)',
                    textDecoration: 'none', fontSize: isTablet ? '0.8rem' : '0.84375rem',
                    padding: isTablet ? '0.4375rem 0.625rem' : '0.4375rem 0.875rem', borderRadius: '0.375rem', transition: '.15s',
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
                    textDecoration: 'none', fontSize: isTablet ? '0.8rem' : '0.84375rem',
                    padding: isTablet ? '0.4375rem 0.625rem' : '0.4375rem 0.875rem', borderRadius: '0.375rem', transition: '.15s',
                    fontWeight: isActive('/admin') ? 500 : 400,
                    background: isActive('/admin') ? 'rgba(255,255,255,.18)' : hovered === 'admin' ? 'rgba(255,255,255,.12)' : 'transparent'
                  }}>⚙️ Admin</Link>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem', alignItems: 'center' }}>
              {token ? (
                <>
                  <span style={{ color: '#7dd3f0', fontSize: '0.84375rem', fontWeight: 500 }}>Hi, {user.name}!</span>
                  <button onClick={handleLogout} style={{
                    border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent',
                    color: '#fff', padding: '0.4375rem 1.125rem', borderRadius: '0.5rem',
                    fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer'
                  }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent', color: '#fff', padding: '0.4375rem 1.125rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>Login</Link>
                  <Link to="/register" style={{ background: '#fff', color: '#0A6B8E', border: 'none', padding: '0.4375rem 1.125rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>Sign Up</Link>
                </>
              )}
            </div>
          </>
        )}

        {/* Mobile right side */}
        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {token && <span style={{ color: '#7dd3f0', fontSize: '0.75rem', fontWeight: 500 }}>Hi, {user.name?.split(' ')[0]}!</span>}
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
              color: '#fff', borderRadius: '0.5rem', padding: '0.375rem 0.625rem',
              cursor: 'pointer', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '4.125rem', left: 0, right: 0, bottom: 0,
          background: '#084D68', zIndex: 99, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', padding: '1rem'
        }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              color: isActive(to) ? '#fff' : 'rgba(255,255,255,.82)',
              textDecoration: 'none', fontSize: '1rem', fontWeight: isActive(to) ? 600 : 400,
              padding: '0.875rem 1rem', borderRadius: '0.625rem', marginBottom: '0.25rem',
              background: isActive(to) ? 'rgba(255,255,255,.18)' : 'transparent',
              display: 'block'
            }}>{label}</Link>
          ))}
          {token && isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
              color: isActive('/admin') ? '#fff' : 'rgba(255,255,255,.82)',
              textDecoration: 'none', fontSize: '1rem', fontWeight: isActive('/admin') ? 600 : 400,
              padding: '0.875rem 1rem', borderRadius: '0.625rem', marginBottom: '0.25rem',
              background: isActive('/admin') ? 'rgba(255,255,255,.18)' : 'transparent',
              display: 'block'
            }}>⚙️ Admin</Link>
          )}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
            {token ? (
              <button onClick={handleLogout} style={{
                width: '100%', border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent',
                color: '#fff', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
              }}>Logout</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', border: '1.5px solid rgba(255,255,255,.5)', background: 'transparent', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#0A6B8E', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;