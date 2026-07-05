import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClub, getEventsByClub } from '../services/api';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

const C = {
  teal: '#0A6B8E', tealDark: '#084D68', tealLight: '#EAF6FA',
  white: '#ffffff', gray50: '#f8fafc', gray100: '#f1f5f9',
  gray200: '#e2e8f0', gray500: '#64748b', gray700: '#334155', navy: '#1a3c5e'
};

const catColors = {
  Hobby: { bg: '#FAEEDA', text: '#633806' }, Cultural: { bg: '#EEEDFE', text: '#3C3489' },
  Academic: { bg: '#EAF6FA', text: '#084D68' }, Sports: { bg: '#E1F5EE', text: '#085041' },
  Technology: { bg: '#EAF6FA', text: '#084D68' }, Volunteer: { bg: '#FAECE7', text: '#712B13' },
};

export default function ClubProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const loadGallery = async () => {
    try {
      const r = await API.get(`/gallery/${id}`);
      setGallery(r.data?.photos || []);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([getClub(id), getEventsByClub(id)]);
        setClub(cRes.data?.club || cRes.data);
        const evData = eRes.data;
        setEvents(Array.isArray(evData) ? evData : (evData?.events || []));
        await loadGallery();
      } catch { setError('Could not load this club.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const isUpcoming = (d) => d && new Date(d) > new Date();

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}><p style={{ color: C.gray500 }}>Loading club…</p></div>;
  if (error || !club) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <p style={{ color: '#e53e3e', marginBottom: 12 }}>{error || 'Club not found.'}</p>
      <button onClick={() => navigate('/clubs')} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>← Back to Clubs</button>
    </div>
  );

  const catStyle = catColors[club.category] || { bg: C.gray100, text: C.gray500 };
  const upcomingEvents = events.filter(e => isUpcoming(e.eventDate)).sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate));
  const pastEvents = events.filter(e => !isUpcoming(e.eventDate)).sort((a,b) => new Date(b.eventDate) - new Date(a.eventDate));
  const hasBanner = !!club.bannerUrl;
  const hasProfilePic = !!club.profilePicUrl;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f0f9fc', minHeight: '100vh' }}>

      {/* ── HEADER — works with or without banner ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: hasBanner ? 'transparent' : `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`,
        minHeight: hasBanner ? 220 : 160,
      }}>
        {hasBanner && (
          <>
            <img src={club.bannerUrl} alt="banner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,77,104,.9) 0%, rgba(0,0,0,.2) 100%)' }} />
          </>
        )}

        <button onClick={() => navigate('/clubs')} style={{
  position: 'absolute', top: 20, left: 20, zIndex: 10,
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
  color: '#fff', border: '1px solid rgba(255,255,255,.3)',
  borderRadius: 20, padding: '8px 16px', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', transition: '.15s'
}}
  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
>
  ← Back to clubs
</button>

        <div style={{ position: 'relative', zIndex: 5, padding: hasBanner ? '0 2rem 1.5rem' : '2rem', display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: hasBanner ? 'auto' : 0, paddingTop: hasBanner ? 60 : '2rem' }}>
          {/* Profile pic — only show if exists */}
          {hasProfilePic && (
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: `3px solid #fff`, overflow: 'hidden', background: C.tealLight, flexShrink: 0 }}>
              <img src={club.profilePicUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            {club.category && (
              <span style={{ display: 'inline-block', marginBottom: 6, background: catStyle.bg, color: catStyle.text, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{club.category}</span>
            )}
            <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{club.clubName}</h1>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 280px)', gap: 24 }}>

          {/* LEFT */}
          <div>
            {/* About */}
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '1.5rem', marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 .75rem', fontSize: 18, fontWeight: 700, color: C.tealDark }}>About Us</h2>
              <p style={{ margin: 0, fontSize: 15, color: C.gray700, lineHeight: 1.7 }}>{club.description || 'No description provided yet.'}</p>
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '1.5rem', marginBottom: 20 }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 700, color: C.tealDark }}>Upcoming Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {upcomingEvents.map(ev => (
                    <div key={ev.eventID} style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.gray200}` }}>
                      {ev.imageUrl
                        ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                        : <div style={{ height: 60, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})` }} />
                      }
                      <div style={{ padding: '12px 14px', background: '#f8fafc' }}>
                        <div style={{ display: 'inline-block', background: C.tealLight, color: C.tealDark, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>UPCOMING</div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.tealDark }}>{ev.title}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: C.gray500 }}>📅 {fmt(ev.eventDate)} · 🕐 {fmtTime(ev.eventDate)}</p>
                        {ev.venue && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gray500 }}>📍 {ev.venue}</p>}
                        {ev.description && <p style={{ margin: '8px 0 0', fontSize: 13, color: C.gray700, lineHeight: 1.5 }}>{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 700, color: C.tealDark }}>Past Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pastEvents.map(ev => (
                    <div key={ev.eventID} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: C.gray50, border: `1px solid ${C.gray200}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: C.tealLight }}>
                        {ev.imageUrl ? <img src={ev.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗓️</div>}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.gray700 }}>{ev.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gray500 }}>📅 {fmt(ev.eventDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '2rem', textAlign: 'center', color: C.gray500 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
                <p style={{ margin: 0, fontSize: 14 }}>No events from this club yet. Check back soon!</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '1.25rem', marginBottom: 16, position: 'sticky', top: 80 }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 700, color: C.tealDark }}>Club Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {club.category && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>📂</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: C.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Category</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: C.tealDark }}>{club.category}</p>
                    </div>
                  </div>
                )}
                
                {club.membershipLink && (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <span style={{ fontSize: 16 }}>🔗</span>
    <div>
      <p style={{ margin: 0, fontSize: 11, color: C.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Join</p>
      <a href={club.membershipLink} target="_blank" rel="noopener noreferrer"
        style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: C.teal, display: 'block', textDecoration: 'none' }}>
        Apply here →
      </a>
    </div>
  </div>
)}
                {club.contactEmail && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>📱</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: C.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Contact</p>
                      <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: C.teal }}>{club.contactEmail}</p>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16 }}>🗓️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: C.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Events</p>
                    <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: C.tealDark }}>{events.length} total · {upcomingEvents.length} upcoming</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GALLERY ── */}
        {gallery.length > 0 && (
          <div style={{ maxWidth: 900, margin: '1.5rem auto 0', padding: '0 1.5rem 3rem' }}>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.gray200}`, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 700, color: C.tealDark }}>📸 Club Gallery</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {gallery.map(photo => (
                  <div key={photo.galleryID} onClick={() => setLightbox(photo)}
                    style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative', paddingBottom: '75%', background: C.gray100 }}>
                    <img src={photo.imageUrl} alt={photo.caption || ''}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      onError={e => e.target.style.display = 'none'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, cursor: 'zoom-out', padding: '2rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 700, width: '100%' }}>
            <img src={lightbox.imageUrl} alt={lightbox.caption || ''}
              style={{ width: '100%', borderRadius: 12, display: 'block', maxHeight: '80vh', objectFit: 'contain' }} />
            {lightbox.caption && (
              <p style={{ color: '#fff', textAlign: 'center', marginTop: 12, fontSize: 14, opacity: .85 }}>{lightbox.caption}</p>
            )}
            <button onClick={() => setLightbox(null)} style={{
              position: 'absolute', top: -14, right: -14,
              background: '#fff', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 18, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

