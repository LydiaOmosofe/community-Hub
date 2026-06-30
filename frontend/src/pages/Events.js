import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/api';

const CAT_COLORS = {
  Tech:      { bg: '#EAF6FA', text: '#084D68' },
  Sports:    { bg: '#E1F5EE', text: '#085041' },
  Culture:   { bg: '#EEEDFE', text: '#3C3489' },
  Academic:  { bg: '#EAF3DE', text: '#27500A' },
  Volunteer: { bg: '#FAECE7', text: '#712B13' },
  Arts:      { bg: '#FBEAF0', text: '#72243E' },
  Cultural:  { bg: '#EEEDFE', text: '#3C3489' },
  Hobby:     { bg: '#FAEEDA', text: '#633806' },
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All events');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getEvents().then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.events || []);
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

  const fmtTime = (d) => { const s = d?.toString().slice(0,16); return s ? new Date(s + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }) : ''; };

  const EventCard = (ev, isUpcoming) => {
    const catStyle = CAT_COLORS[ev.category] || { bg: '#EAF6FA', text: '#084D68' };
    return (
      <div key={ev.eventID} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: ev.imageUrl ? '#111' : catStyle.bg }}>
          {ev.imageUrl
            ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
            : <span style={{ fontSize: 44, color: catStyle.text }}>🗓️</span>}
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#0A6B8E', color: '#fff', borderRadius: 8, padding: '5px 10px', textAlign: 'center', minWidth: 44 }}>
            <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1 }}>{new Date(ev.eventDate).getDate()}</div>
            <div style={{ fontSize: 9, opacity: .85, marginTop: 1 }}>{new Date(ev.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: isUpcoming ? '#0A6B8E' : 'rgba(0,0,0,.4)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 500 }}>{isUpcoming ? 'Upcoming' : 'Past'}</div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>{ev.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#0A6B8E', fontWeight: 500 }}>🏛️ {ev.clubName || 'General'}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>🕐 {fmtTime(ev.eventDate)}</span>
            {ev.venue && <span style={{ fontSize: 11, color: '#6b7280' }}>📍 {ev.venue}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {ev.category && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 500, background: catStyle.bg, color: catStyle.text }}>{ev.category}</span>}
            <button onClick={() => setSelected(ev)} style={{ background: '#EAF6FA', color: '#0A6B8E', border: 'none', padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginLeft: 'auto' }}>Details</button>
          </div>
        </div>
      </div>
    );
  };

  const upcomingFiltered = upcoming.filter(e => filter === 'All events' || e.category === filter);
  const pastFiltered = sortedEvents.filter(e => new Date(e.eventDate) <= now).filter(e => filter === 'All events' || e.category === filter);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f0f9fc', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', padding: '2.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 500, marginBottom: 6 }}>Upcoming Events</h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, marginBottom: '1.5rem' }}>Find workshops, competitions, cultural nights and activities</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[[thisMonth.length, 'This month'], [thisWeek.length, 'This week'], [events.length, 'Total this year']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 500 }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e5e7eb', padding: '0 3rem', display: 'flex', alignItems: 'center', gap: 6, position: 'sticky', top: 66, zIndex: 90 }}>
        {['All events', 'Culture', 'Tech', 'Sports', 'Academic', 'Volunteer', 'Arts'].map(f => (
          <span key={f} onClick={() => setFilter(f)} style={{
            padding: '14px 16px', fontSize: 13, color: filter === f ? '#0A6B8E' : '#6b7280',
            cursor: 'pointer', borderBottom: filter === f ? '2px solid #0A6B8E' : '2px solid transparent',
            fontWeight: filter === f ? 500 : 400, transition: '.15s', whiteSpace: 'nowrap'
          }}>{f}</span>
        ))}
      </div>

      {/* ── UPCOMING EVENTS ── */}
      <div style={{ padding: '2.5rem 3rem 0' }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#111', marginBottom: '1.25rem' }}>Upcoming events</p>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>Loading events…</p>
        ) : upcomingFiltered.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 14, padding: '1rem 0 2rem' }}>No upcoming events right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: '2.5rem' }}>
            {upcomingFiltered.map(ev => EventCard(ev, true))}
          </div>
        )}
      </div>

      {/* ── PAST EVENTS ── */}
      <div style={{ padding: '0 3rem 2.5rem' }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#111', marginBottom: '1.25rem' }}>Past events</p>
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {pastFiltered.map(ev => EventCard(ev, false))}
          </div>
        )}
      </div>

      {/* ── EVENT DETAIL MODAL ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            {selected.imageUrl && (
              <div style={{ height: 280, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={selected.imageUrl} alt={selected.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
            {!selected.imageUrl && (
              <div style={{ height: 120, background: 'linear-gradient(135deg,#084D68,#0A6B8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🗓️</div>
            )}

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#084D68', flex: 1, paddingRight: 12 }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0f9fc', borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>Date & Time</p>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#111' }}>
                      {new Date(selected.eventDate).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{new Date(selected.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' })}
                    </p>
                  </div>
                </div>

                {selected.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0f9fc', borderRadius: 10 }}>
                    <span style={{ fontSize: 20 }}>📍</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>Venue</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#111' }}>{selected.venue}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0f9fc', borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>🏛️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>Organised by</p>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: '#0A6B8E' }}>{selected.clubName || 'General'}</p>
                  </div>
                </div>
              </div>

              {selected.description && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em' }}>About this event</p>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
                    {selected.description
                      .split(/[|\n]/)
                      .map(s => s.trim())
                      .filter(Boolean)
                      .map((line, i) => (
                        <p key={i} style={{ margin: '0 0 8px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#0A6B8E', flexShrink: 0, marginTop: 2 }}>•</span>
                          <span>{line}</span>
                        </p>
                      ))
                    }
                  </div>
                </div>
              )}

              <button onClick={() => setSelected(null)} style={{
                width: '100%', background: '#0A6B8E', color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}