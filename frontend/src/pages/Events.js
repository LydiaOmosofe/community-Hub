import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import { useWindowSize } from '../hooks/useWindowSize';
import { useTheme } from '../context/ThemeContext';

const CAT_COLORS = {
  Tech:      { bg: '#EAF6FA', text: '#084D68' },
  Sports:    { bg: '#E1F5EE', text: '#085041' },
  Culture:   { bg: '#EEEDFE', text: '#3C3489' },
  Cultural:  { bg: '#EEEDFE', text: '#3C3489' },
  Academic:  { bg: '#EAF3DE', text: '#27500A' },
  Volunteer: { bg: '#FAECE7', text: '#712B13' },
  Arts:      { bg: '#FBEAF0', text: '#72243E' },
  Hobby:     { bg: '#FAEEDA', text: '#633806' },
};

export default function Events() {
  const { isMobile } = useWindowSize();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All events');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const tabBg = darkMode ? '#1e293b' : '#fff';
  const tabBorder = darkMode ? '#334155' : '#e5e7eb';

  useEffect(() => {
    getEvents().then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.events || []);
      console.log('Event categories:', d.map(e => ({ title: e.title, category: e.category, eventDate: e.eventDate })));
      setEvents(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.eventDate) > now);
  const thisMonth = events.filter(e => { const d = new Date(e.eventDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const thisWeek = events.filter(e => { const d = new Date(e.eventDate); const diff = (d - now) / (1000 * 60 * 60 * 24); return diff >= 0 && diff <= 7; });

  const sortedEvents = [...events].sort((a, b) => {
    const aUp = new Date(a.eventDate) > now;
    const bUp = new Date(b.eventDate) > now;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    if (aUp && bUp) return new Date(a.eventDate) - new Date(b.eventDate);
    return new Date(b.eventDate) - new Date(a.eventDate);
  });

  const fmtTime = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const upcomingFiltered = upcoming.filter(e => filter === 'All events' || e.category === filter);
  const pastFiltered = sortedEvents.filter(e => new Date(e.eventDate) <= now).filter(e => filter === 'All events' || e.category === filter);

  const EventCard = ({ ev, isUpcoming }) => {
    const catStyle = CAT_COLORS[ev.category] || { bg: '#EAF6FA', text: '#084D68' };
    return (
      <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: isMobile ? 10 : 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s, background .3s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ aspectRatio: ev.imageUrl ? '3 / 4' : '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: ev.imageUrl ? '#111' : catStyle.bg }}>
          {ev.imageUrl ? (
            <>
              <img src={ev.imageUrl} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(0.6)', transform: 'scale(1.15)' }} onError={e => { e.target.style.display = 'none'; }} />
              <img src={ev.imageUrl} alt={ev.title} style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} onError={e => { e.target.style.display = 'none'; }} />
            </>
          ) : <span style={{ fontSize: isMobile ? 20 : 44, color: catStyle.text }}>🗓️</span>}
          <div style={{ position: 'absolute', top: isMobile ? 4 : 10, left: isMobile ? 4 : 10, background: '#0A6B8E', color: '#fff', borderRadius: isMobile ? 5 : 8, padding: isMobile ? '2px 4px' : '5px 10px', textAlign: 'center', minWidth: isMobile ? 26 : 44, zIndex: 2 }}>
            <div style={{ fontSize: isMobile ? 10 : 16, fontWeight: 700, lineHeight: 1 }}>{new Date(ev.eventDate).getDate()}</div>
            <div style={{ fontSize: isMobile ? 6 : 9, opacity: .85, marginTop: 1 }}>{new Date(ev.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
          </div>
          <div style={{ position: 'absolute', top: isMobile ? 4 : 10, right: isMobile ? 4 : 10, background: isUpcoming ? '#0A6B8E' : 'rgba(0,0,0,.4)', color: '#fff', borderRadius: isMobile ? 4 : 6, padding: isMobile ? '1px 4px' : '2px 8px', fontSize: isMobile ? 7 : 10, fontWeight: 700, zIndex: 2 }}>
            {isMobile ? (isUpcoming ? '●' : '') : (isUpcoming ? 'Upcoming' : 'Past')}
          </div>
        </div>
        <div style={{ padding: isMobile ? '6px 6px' : '12px 14px' }}>
          <p style={{ fontSize: isMobile ? 9.5 : 13, fontWeight: 700, color: textPrimary, marginBottom: isMobile ? 2 : 6, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 3, marginBottom: isMobile ? 4 : 10 }}>
            <span style={{ fontSize: isMobile ? 7.5 : 11, color: '#0A6B8E', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🏛️ {ev.clubName || 'General'}</span>
            <span style={{ fontSize: isMobile ? 7.5 : 11, color: textSecondary }}>🕐 {fmtTime(ev.eventDate)}</span>
            {ev.venue && <span style={{ fontSize: isMobile ? 7.5 : 11, color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {ev.venue}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            {ev.category && <span style={{ fontSize: isMobile ? 6.5 : 10, padding: isMobile ? '1px 5px' : '2px 8px', borderRadius: 8, fontWeight: 700, background: catStyle.bg, color: catStyle.text }}>{ev.category}</span>}
            <button onClick={() => setSelected(ev)} style={{ background: '#EAF6FA', color: '#0A6B8E', border: 'none', padding: isMobile ? '3px 6px' : '6px 14px', borderRadius: isMobile ? 5 : 7, fontSize: isMobile ? 8 : 12, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>Details</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: bg, minHeight: '100vh', transition: 'background .3s' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : 0 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, marginBottom: 6 }}>Upcoming Events</h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, fontWeight: 500 }}>Find workshops, competitions, cultural nights and activities</p>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '1.5rem' : '2rem' }}>
          {[[thisMonth.length, 'This month'], [thisWeek.length, 'This week'], [events.length, 'Total this year']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800 }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 10, marginTop: 2, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{ background: tabBg, borderBottom: `0.5px solid ${tabBorder}`, padding: isMobile ? '0 1rem' : '0 3rem', display: 'flex', alignItems: 'center', gap: isMobile ? 20 : 32, position: 'sticky', top: 66, zIndex: 90, overflowX: 'auto', transition: 'background .3s' }}>
        {[
          { label: 'All events', value: 'All events' },
          { label: 'Culture', value: 'Cultural' },
          { label: 'Tech', value: 'Tech' },
          { label: 'Sports', value: 'Sports' },
          { label: 'Academic', value: 'Academic' },
          { label: 'Volunteer', value: 'Volunteer' },
          { label: 'Arts', value: 'Arts' },
        ].map(({ label, value }) => (
          <span key={value} onClick={() => setFilter(value)} style={{
            padding: '16px 4px', fontSize: 14.5,
            color: filter === value ? '#0A6B8E' : textSecondary,
            cursor: 'pointer',
            borderBottom: filter === value ? '3px solid #0A6B8E' : '3px solid transparent',
            fontWeight: filter === value ? 900 : 700,
            transition: '.15s', whiteSpace: 'nowrap', flexShrink: 0
          }}>{label}</span>
        ))}
      </div>

      {/* ── UPCOMING ── */}
      <div style={{ padding: isMobile ? '1.5rem 1rem 0' : '2.5rem 3rem 0' }}>
        <p style={{ fontSize: 20, fontWeight: 900, color: textPrimary, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Upcoming events</p>
        {loading ? (
          <p style={{ textAlign: 'center', color: textSecondary, padding: '3rem' }}>Loading events…</p>
        ) : upcomingFiltered.length === 0 ? (
          <p style={{ color: textSecondary, fontSize: 14, padding: '1rem 0 2rem' }}>No upcoming events right now.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 8 : 16, marginBottom: '2.5rem'
          }}>
            {upcomingFiltered.map(ev => (
              <EventCard key={ev.eventID} ev={ev} isUpcoming={true} />
            ))}
          </div>
        )}
      </div>

      {/* ── PAST ── */}
      <div style={{ padding: isMobile ? '0 1rem 2.5rem' : '0 3rem 2.5rem' }}>
        <p style={{ fontSize: 20, fontWeight: 900, color: textPrimary, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Past events</p>
        {!loading && pastFiltered.length === 0 ? (
          <p style={{ color: textSecondary, fontSize: 14 }}>No past events found.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 8 : 16
          }}>
            {pastFiltered.map(ev => (
              <EventCard key={ev.eventID} ev={ev} isUpcoming={false} />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: cardBg, borderRadius: 16, width: '100%', maxWidth: 520,
            overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto', transition: 'background .3s'
          }}>
            {selected.imageUrl ? (
              <div style={{ height: 280, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
              </div>
            ) : (
              <div style={{ height: 120, background: 'linear-gradient(135deg,#084D68,#0A6B8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🗓️</div>
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#084D68', flex: 1, paddingRight: 12 }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)} style={{ background: darkMode ? '#334155' : '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                {[
                  { icon: '📅', label: 'Date & Time', value: `${new Date(selected.eventDate).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${fmtTime(selected.eventDate)}` },
                  selected.venue ? { icon: '📍', label: 'Venue', value: selected.venue } : null,
                  { icon: '🏛️', label: 'Organised by', value: selected.clubName || 'General' },
                ].filter(Boolean).map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: darkMode ? '#0f172a' : '#f0f9fc', borderRadius: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: label === 'Organised by' ? '#0A6B8E' : textPrimary }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>About this event</p>
                  <div style={{ fontSize: 14, color: textPrimary, lineHeight: 1.8 }}>
                    {selected.description.split(/[|\n]/).map(s => s.trim()).filter(Boolean).map((line, i) => (
                      <p key={i} style={{ margin: '0 0 8px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: '#0A6B8E', flexShrink: 0, marginTop: 2 }}>•</span>
                        <span>{line}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setSelected(null)} style={{ width: '100%', background: '#0A6B8E', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}