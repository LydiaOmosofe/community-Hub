import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClub, getEventsByClub } from '../services/api';
import { useWindowSize } from '../hooks/useWindowSize';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const catColors = {
  Hobby:      { bg: '#FAEEDA', text: '#633806' },
  Cultural:   { bg: '#EEEDFE', text: '#3C3489' },
  Academic:   { bg: '#EAF6FA', text: '#084D68' },
  Sports:     { bg: '#E1F5EE', text: '#085041' },
  Technology: { bg: '#EAF6FA', text: '#084D68' },
  Volunteer:  { bg: '#FAECE7', text: '#712B13' },
  Community:  { bg: '#FEF3C7', text: '#92400E' },
};

export default function ClubProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { darkMode } = useTheme();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const bg = darkMode ? '#0f172a' : '#f0f9fc';
  const cardBg = darkMode ? '#1e293b' : '#fff';
  const cardBorder = darkMode ? '#334155' : '#e2e8f0';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([getClub(id), getEventsByClub(id)]);
        setClub(cRes.data?.club || cRes.data);
        const evData = eRes.data;
        setEvents(Array.isArray(evData) ? evData : (evData?.events || []));
        const gRes = await API.get(`/gallery/${id}`);
        setGallery(gRes.data?.photos || []);
      } catch { setError('Could not load this club.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const isUpcoming = (d) => d && new Date(d) > new Date();

  const goNext = (e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % gallery.length); };
  const goPrev = (e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + gallery.length) % gallery.length); };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}><p style={{ color: textSecondary }}>Loading club…</p></div>;
  if (error || !club) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg }}>
      <p style={{ color: '#e53e3e', marginBottom: 12 }}>{error || 'Club not found.'}</p>
      <button onClick={() => navigate('/clubs')} style={{ background: '#0A6B8E', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>← Back</button>
    </div>
  );

  const catStyle = catColors[club.category] || { bg: '#EAF6FA', text: '#084D68' };
  const upcomingEvents = events.filter(e => isUpcoming(e.eventDate)).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  const pastEvents = events.filter(e => !isUpcoming(e.eventDate)).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
  const lightboxPhoto = lightboxIndex !== null ? gallery[lightboxIndex] : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: bg, minHeight: '100vh', transition: 'background .3s' }}>

      {/* ── HEADER ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: club.bannerUrl ? 'transparent' : 'linear-gradient(135deg, #084D68, #0A6B8E)',
        minHeight: club.bannerUrl ? 220 : 160,
      }}>
        {club.bannerUrl && (
          <>
            <img src={club.bannerUrl} alt="banner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,77,104,.9) 0%, rgba(0,0,0,.2) 100%)' }} />
          </>
        )}

        <button onClick={() => navigate('/clubs')} style={{
          position: 'absolute', top: isMobile ? 8 : 20, left: isMobile ? 10 : 20, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
          color: '#fff', border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 20, padding: isMobile ? '5px 12px' : '8px 16px', fontSize: isMobile ? 11 : 13,
          fontWeight: 600, cursor: 'pointer'
        }}>← Back</button>

        <div style={{ position: 'relative', zIndex: 5, padding: club.bannerUrl ? '0 1.5rem 1.5rem' : '1.5rem', display: 'flex', alignItems: 'flex-end', gap: 18, paddingTop: club.bannerUrl ? (isMobile ? 46 : 60) : (isMobile ? 46 : '2rem') }}>
          {club.profilePicUrl && (
            <div style={{ width: isMobile ? 72 : 96, height: isMobile ? 72 : 96, borderRadius: '50%', border: '3px solid #fff', overflow: 'hidden', background: '#EAF6FA', flexShrink: 0 }}>
              <img src={club.profilePicUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            {club.category && (
              <span style={{ display: 'inline-block', marginBottom: 6, background: catStyle.bg, color: catStyle.text, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{club.category}</span>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{club.clubName}</h1>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '1rem' : '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(0, 280px)', gap: 24 }}>

          {/* LEFT */}
          <div>
            {/* About */}
            <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.5rem', marginBottom: 20, transition: 'background .3s' }}>
              <h2 style={{ margin: '0 0 .75rem', fontSize: 18, fontWeight: 800, color: '#0A6B8E' }}>About Us</h2>
              <p style={{ margin: 0, fontSize: 15, color: textSecondary, lineHeight: 1.7 }}>{club.description || 'No description provided yet.'}</p>
            </div>

            {/* Club info on mobile */}
            {isMobile && (
              <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.25rem', marginBottom: 20, transition: 'background .3s' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 800, color: '#0A6B8E' }}>Club Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    club.category && { icon: '📂', label: 'Category', value: club.category, isLink: false },
                    club.membershipLink && { icon: '🔗', label: 'Join', value: 'Apply here →', href: club.membershipLink, isLink: true },
                    club.contactEmail && { icon: '📱', label: 'Contact', value: club.contactEmail, isLink: false },
                    { icon: '🗓️', label: 'Events', value: `${events.length} total · ${upcomingEvents.length} upcoming`, isLink: false },
                  ].filter(Boolean).map(({ icon, label, value, href, isLink }) => (
                    <div key={label} style={{ display: 'flex', gap: 10 }}>
                      <span>{icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                        {isLink
                          ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: '#0A6B8E', textDecoration: 'none' }}>{value}</a>
                          : <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: textPrimary }}>{value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.5rem', marginBottom: 20, transition: 'background .3s' }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 800, color: '#0A6B8E' }}>Upcoming Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {upcomingEvents.map(ev => (
                    <div key={ev.eventID} style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
                      {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                        : <div style={{ height: 60, background: 'linear-gradient(135deg, #0A6B8E, #084D68)' }} />}
                      <div style={{ padding: '12px 14px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
                        <div style={{ display: 'inline-block', background: '#EAF6FA', color: '#084D68', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>UPCOMING</div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: textPrimary }}>{ev.title}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>📅 {fmt(ev.eventDate)} · 🕐 {fmtTime(ev.eventDate)}</p>
                        {ev.venue && <p style={{ margin: '2px 0 0', fontSize: 12, color: textSecondary }}>📍 {ev.venue}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past events */}
            {pastEvents.length > 0 && (
              <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.5rem', transition: 'background .3s' }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 800, color: '#0A6B8E' }}>Past Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pastEvents.map(ev => (
                    <div key={ev.eventID} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${cardBorder}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#EAF6FA' }}>
                        {ev.imageUrl ? <img src={ev.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗓️</div>}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary }}>{ev.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: textSecondary }}>📅 {fmt(ev.eventDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '2rem', textAlign: 'center', color: textSecondary, transition: 'background .3s' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
                <p style={{ margin: 0, fontSize: 14 }}>No events from this club yet. Check back soon!</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR — desktop only */}
          {!isMobile && (
            <div>
              <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.25rem', position: 'sticky', top: 80, transition: 'background .3s' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 800, color: '#0A6B8E' }}>Club Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    club.category && { icon: '📂', label: 'Category', value: club.category, isLink: false },
                    club.membershipLink && { icon: '🔗', label: 'Join', value: 'Apply here →', href: club.membershipLink, isLink: true },
                    club.contactEmail && { icon: '📱', label: 'Contact', value: club.contactEmail, isLink: false },
                    { icon: '🗓️', label: 'Events', value: `${events.length} total · ${upcomingEvents.length} upcoming`, isLink: false },
                  ].filter(Boolean).map(({ icon, label, value, href, isLink }) => (
                    <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
                        {isLink
                          ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#0A6B8E', display: 'block', textDecoration: 'none' }}>{value}</a>
                          : <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: textPrimary }}>{value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── GALLERY ── */}
        {gallery.length > 0 && (
          <div style={{ margin: '1.5rem 0 0', paddingBottom: '3rem' }}>
            <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: '1.5rem', transition: 'background .3s' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: 18, fontWeight: 800, color: '#0A6B8E' }}>📸 Club Gallery</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {gallery.map((photo, index) => (
                  <div key={photo.galleryID} onClick={() => setLightboxIndex(index)}
                    style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative', paddingBottom: '75%', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
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
      {lightboxPhoto && (
        <div onClick={() => setLightboxIndex(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem'
        }}>
          <button onClick={goPrev} style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
            color: '#fff', width: 44, height: 44, borderRadius: '50%',
            cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>‹</button>

          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 700, width: '100%' }}>
            <img src={lightboxPhoto.imageUrl} alt={lightboxPhoto.caption || ''}
              style={{ width: '100%', borderRadius: 12, display: 'block', maxHeight: '80vh', objectFit: 'contain' }} />
            {lightboxPhoto.caption && <p style={{ color: '#fff', textAlign: 'center', marginTop: 12, fontSize: 14, opacity: .85 }}>{lightboxPhoto.caption}</p>}
            <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', fontSize: 12, marginTop: 4 }}>{lightboxIndex + 1} / {gallery.length}</p>
            <button onClick={() => setLightboxIndex(null)} style={{
              position: 'absolute', top: -14, right: -14,
              background: '#fff', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 18, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>×</button>
          </div>

          <button onClick={goNext} style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
            color: '#fff', width: 44, height: 44, borderRadius: '50%',
            cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>›</button>
        </div>
      )}
    </div>
  );
}