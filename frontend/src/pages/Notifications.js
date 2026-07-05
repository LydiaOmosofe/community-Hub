import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });
API.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const TYPE_MAP = {
  info:    { bg: '#EAF6FA', color: '#084D68', tag: 'Info',    icon: 'ℹ️' },
  warning: { bg: '#FAEEDA', color: '#633806', tag: 'Warning', icon: '⚠️' },
  success: { bg: '#EAF3DE', color: '#3B6D11', tag: 'Success', icon: '✅' },
  danger:  { bg: '#FAECE7', color: '#712B13', tag: 'Urgent',  icon: '🚨' },
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const r = await API.get('/notifications');
      const d = Array.isArray(r.data) ? r.data : (r.data?.notifications || []);
      setNotifs(d);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
  try { await API.patch(`/notifications/${id}`); load(); } catch {}
};

  const fmt = (d) => d ? new Date(d).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs.filter(n => n.type === filter);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f0f9fc', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', padding: '2.5rem 3rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 500, marginBottom: 6 }}>Notifications</h1>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14 }}>Stay updated with club activities and important notices</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 240px', gap: '2rem' }}>

        {/* Main */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[['all', 'All'], ['unread', 'Unread'], ['info', 'Info'], ['warning', 'Warning'], ['success', 'Success'], ['danger', 'Urgent']].map(([val, label]) => (
              <span key={val} onClick={() => setFilter(val)} style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                fontWeight: 500, transition: '.15s',
                background: filter === val ? '#0A6B8E' : '#fff',
                color: filter === val ? '#fff' : '#6b7280',
                border: filter === val ? '0.5px solid #0A6B8E' : '0.5px solid #e5e7eb'
              }}>{label}</span>
            ))}
          </div>

          {/* Pinned / unread highlight */}
          {unreadCount > 0 && filter === 'all' && (
            <div style={{ background: '#FFF8E7', border: '1.5px solid #EF9F27', borderRadius: 14, padding: '16px 20px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 38, height: 38, background: '#FAEEDA', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>📌</div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, color: '#633806', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>📌 You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: '#412402' }}>Mark them as read when you're done!</p>
              </div>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>Loading notifications…</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <p>No notifications here yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(n => {
                const t = TYPE_MAP[n.type] || TYPE_MAP.info;
                return (
                  <div key={n.notificationID || n.id} style={{
                    background: '#fff', border: `0.5px solid ${n.isRead ? '#e5e7eb' : '#0A6B8E'}`,
                    borderLeft: `4px solid ${n.isRead ? '#e5e7eb' : '#0A6B8E'}`,
                    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                    transition: 'border-color .15s, transform .15s',
                    display: 'flex', gap: 14, alignItems: 'flex-start'
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: t.color }}>{t.tag}</span>
                        {!n.isRead && <span style={{ background: '#0A6B8E', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 8 }}>New</span>}
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{fmt(n.sentDate)}</span>
                      </div>
                     {n.title && <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{n.title}</p>}
<p style={{ fontSize: 13.5, color: '#111', lineHeight: 1.6 }}>{n.message}</p>
                      {!n.isRead && (
                        <div style={{ marginTop: 10 }}>
                          <span onClick={() => markRead(n.notifID || n.id)} style={{ fontSize: 12, color: '#0A6B8E', fontWeight: 500, cursor: 'pointer' }}>Mark as read →</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 12 }}>Browse by type</p>
            {[['All', notifs.length], ['Unread', notifs.filter(n => !n.isRead).length], ['Info', notifs.filter(n => n.type === 'info').length], ['Warning', notifs.filter(n => n.type === 'warning').length], ['Success', notifs.filter(n => n.type === 'success').length], ['Urgent', notifs.filter(n => n.type === 'danger').length]].map(([label, count]) => (
              <div key={label} onClick={() => setFilter(label.toLowerCase())} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '0.5px solid #f3f4f6', cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: '#111' }}>{label}</span>
                <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 8 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
