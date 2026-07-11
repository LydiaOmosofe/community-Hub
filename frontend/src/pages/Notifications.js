import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useWindowSize } from '../hooks/useWindowSize';
import { useTheme } from '../context/ThemeContext';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const TYPE_CONFIG = {
  info:    { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', label: 'Info' },
  warning: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⚠️', label: 'Warning' },
  success: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', label: 'Success' },
  danger:  { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '🚨', label: 'Urgent' },
};

export default function Notifications() {
  const { isMobile } = useWindowSize();
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // dark mode colors
  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const sidebarBg = darkMode ? '#1e293b' : '#fff';

const load = useCallback(async () => {
  setLoading(true);
  try { const r = await API.get('/notifications/all'); setNotifications(Array.isArray(r.data) ? r.data : (r.data?.notifications || [])); }
  catch { console.error('Could not load notifications.'); }
  finally { setLoading(false); }
}, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try { await API.patch(`/notifications/${id}`); load(); } catch {}
  };

  const markAllRead = async () => {
    try { await API.patch('/notifications/mark-all-read'); load(); } catch {}
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const filters = ['All', 'Unread', 'Info', 'Warning', 'Success', 'Urgent'];
  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Info') return n.type === 'info';
    if (filter === 'Warning') return n.type === 'warning';
    if (filter === 'Success') return n.type === 'success';
    if (filter === 'Urgent') return n.type === 'danger';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const typeCounts = {
    All: notifications.length,
    Unread: unreadCount,
    Info: notifications.filter(n => n.type === 'info').length,
    Warning: notifications.filter(n => n.type === 'warning').length,
    Success: notifications.filter(n => n.type === 'success').length,
    Urgent: notifications.filter(n => n.type === 'danger').length,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: bg, minHeight: '100vh', transition: 'background .3s' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem' }}>
        <h1 style={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, marginBottom: 6 }}>Notifications</h1>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, fontWeight: 500 }}>Stay updated with club activities and important notices</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ marginTop: 12, background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ✓ Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '1rem' : '2rem 1.5rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 220px', gap: 24 }}>

        {/* LEFT — notifications list */}
        <div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {filters.map(f => (
              <span key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                fontWeight: filter === f ? 800 : 600,
                background: filter === f ? '#0A6B8E' : cardBg,
                color: filter === f ? '#fff' : textSecondary,
                border: `1.5px solid ${filter === f ? '#0A6B8E' : cardBorder}`,
                transition: '.15s'
              }}>{f}</span>
            ))}
          </div>

          {/* Unread banner */}
          {unreadCount > 0 && filter !== 'Unread' && (
            <div style={{ background: darkMode ? '#1c1a0e' : '#fefce8', border: `1px solid ${darkMode ? '#854d0e' : '#fde68a'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📌</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: darkMode ? '#fbbf24' : '#92400e' }}>
                  YOU HAVE {unreadCount} UNREAD NOTIFICATION{unreadCount > 1 ? 'S' : ''}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: darkMode ? '#fbbf24' : '#92400e' }}>Mark them as read when you're done!</p>
              </div>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: 'center', color: textSecondary, padding: '3rem' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>No notifications here yet.</p>
              <p style={{ fontSize: 13 }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(n => {
                const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                return (
                  <div key={n.notifID} style={{
                    background: !n.isRead ? (darkMode ? '#1e2d3d' : '#f0f9fc') : cardBg,
                    border: `1.5px solid ${!n.isRead ? '#0A6B8E' : cardBorder}`,
                    borderLeft: `4px solid ${tc.color}`,
                    borderRadius: 12, padding: '14px 16px',
                    transition: 'background .3s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: darkMode ? '#0f172a' : tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {tc.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: darkMode ? '#0f172a' : tc.bg, color: tc.color, padding: '2px 8px', borderRadius: 6 }}>{tc.label}</span>
                          {!n.isRead && <span style={{ fontSize: 10, fontWeight: 800, background: '#0A6B8E', color: '#fff', padding: '2px 8px', borderRadius: 6 }}>New</span>}
                          <span style={{ fontSize: 11, color: textSecondary, marginLeft: 'auto' }}>{fmt(n.sentDate)}</span>
                        </div>
                        {n.title && <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: textPrimary }}>{n.title}</p>}
                        <p style={{ margin: 0, fontSize: 13.5, color: darkMode ? '#cbd5e1' : '#374151', lineHeight: 1.6 }}>{n.message}</p>
                        {!n.isRead && (
                          <span onClick={() => markRead(n.notifID)} style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#0A6B8E', fontWeight: 700, cursor: 'pointer' }}>
                            Mark as read →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — sidebar */}
        {!isMobile && (
          <div>
            <div style={{ background: sidebarBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '1.25rem', position: 'sticky', top: 80, transition: 'background .3s' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: '0 0 1rem' }}>Browse by type</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filters.map(f => (
                  <div key={f} onClick={() => setFilter(f)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    background: filter === f ? (darkMode ? '#0f172a' : '#EAF6FA') : 'transparent',
                    transition: '.15s'
                  }}>
                    <span style={{ fontSize: 13, fontWeight: filter === f ? 700 : 500, color: filter === f ? '#0A6B8E' : textSecondary }}>{f}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: textSecondary, background: darkMode ? '#334155' : '#f1f5f9', borderRadius: 12, padding: '1px 8px' }}>{typeCounts[f]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}