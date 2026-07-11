import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize';
import { useTheme } from '../context/ThemeContext';

const SEGiLogo = () => (
  <img src="/SEGILOGO.png" alt="SEGi University"
    style={{ width: 38, height: 38, objectFit: 'contain' }}
    onError={e => { e.target.style.display = 'none'; }} />
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function DarkToggle({ darkMode, toggleDark }) {
  return (
    <button onClick={toggleDark} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} style={{
      background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
      color: '#fff', borderRadius: 8, width: 36, height: 36,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, transition: 'background .2s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useWindowSize();
  const { darkMode, toggle: toggleDark } = useTheme();
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
        background: '#0A6B8E', height: 66,
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2.5rem',
        position: 'sticky', top: 0, zIndex: 100,
        fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <SEGiLogo />
          {!isMobile && (
            <div>
              <b style={{ color: '#fff', fontSize: 15, fontWeight: 800, display: 'block', letterSpacing: '.2px' }}>SEGi University</b>
              <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 600 }}>Community Hub</span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.2)', margin: '0 1.5rem', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
              {links.map(({ to, label }) => (
                <Link key={to} to={to}
                  onMouseEnter={() => setHovered(to)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    color: '#fff', textDecoration: 'none',
                    fontSize: isTablet ? 13 : 14.5,
                    padding: isTablet ? '7px 10px' : '7px 16px',
                    borderRadius: 6, transition: '.15s',
                    fontWeight: isActive(to) ? 800 : 600,
                    background: isActive(to) ? 'rgba(255,255,255,.22)' : hovered === to ? 'rgba(255,255,255,.12)' : 'transparent',
                    opacity: isActive(to) ? 1 : 0.88,
                    letterSpacing: '.1px'
                  }}>{label}</Link>
              ))}
              {token && isAdmin && (
                <Link to="/admin"
                  onMouseEnter={() => setHovered('admin')}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    color: '#fff', textDecoration: 'none',
                    fontSize: isTablet ? 13 : 14.5,
                    padding: isTablet ? '7px 10px' : '7px 16px',
                    borderRadius: 6, transition: '.15s',
                    fontWeight: isActive('/admin') ? 800 : 600,
                    background: isActive('/admin') ? 'rgba(255,255,255,.22)' : hovered === 'admin' ? 'rgba(255,255,255,.12)' : 'transparent',
                    opacity: isActive('/admin') ? 1 : 0.88
                  }}>⚙️ Admin</Link>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: '1rem', alignItems: 'center' }}>
              <DarkToggle darkMode={darkMode} toggleDark={toggleDark} />
              {token ? (
                <>
                  <span style={{ color: '#7dd3f0', fontSize: 14, fontWeight: 700 }}>Hi, {user.name}!</span>
                  <button onClick={handleLogout} style={{
                    border: '2px solid rgba(255,255,255,.6)', background: 'transparent',
                    color: '#fff', padding: '7px 18px', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ border: '2px solid rgba(255,255,255,.6)', background: 'transparent', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>Login</Link>
                  <Link to="/register" style={{ background: '#fff', color: '#0A6B8E', border: 'none', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer', textDecoration: 'none' }}>Sign Up</Link>
                </>
              )}
            </div>
          </>
        )}

        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <DarkToggle darkMode={darkMode} toggleDark={toggleDark} />
            {token && <span style={{ color: '#7dd3f0', fontSize: 12, fontWeight: 700 }}>Hi, {user.name?.split(' ')[0]}!</span>}
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
              color: '#fff', borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 66, left: 0, right: 0, bottom: 0,
          background: darkMode ? '#0f172a' : '#084D68',
          zIndex: 99, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', padding: '1rem'
        }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              color: '#fff', textDecoration: 'none',
              fontSize: 17, fontWeight: isActive(to) ? 800 : 600,
              padding: '14px 16px', borderRadius: 10, marginBottom: 4,
              background: isActive(to) ? 'rgba(255,255,255,.18)' : 'transparent',
              display: 'block', letterSpacing: '.1px'
            }}>{label}</Link>
          ))}
          {token && isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
              color: '#fff', textDecoration: 'none',
              fontSize: 17, fontWeight: isActive('/admin') ? 800 : 600,
              padding: '14px 16px', borderRadius: 10, marginBottom: 4,
              background: isActive('/admin') ? 'rgba(255,255,255,.18)' : 'transparent',
              display: 'block'
            }}>⚙️ Admin</Link>
          )}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', marginTop: 8, paddingTop: 12 }}>
            {token ? (
              <button onClick={handleLogout} style={{
                width: '100%', border: '2px solid rgba(255,255,255,.5)', background: 'transparent',
                color: '#fff', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer'
              }}>Logout</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', border: '2px solid rgba(255,255,255,.5)', background: 'transparent', color: '#fff', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#0A6B8E', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;