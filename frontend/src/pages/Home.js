import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClubs, getEvents } from '../services/api';

const SEGiLogo = () => (
  <img src="/SEGILOGO.png" alt="SEGi University" style={{ width: 44, height: 44, objectFit: 'contain',  }}
    onError={e => e.target.style.display='none'} />
);

const SLIDES = [
  { img: '/photos/IMG_3067.PNG', bg: '#084D68', tag: '✦ AI-powered campus hub', title: 'Welcome to', em: 'SEGi Community Hub', desc: 'Discover clubs, join events, and connect with students across all SEGi campuses.', btn1: 'Explore clubs', btn2: 'Upcoming events', route1: '/clubs', route2: '/events' },
  { img: '/photos/IMG_3063.PNG', bg: '#0F6E56', tag: '🌍 SISS · Cultural Night', title: 'Cultural night', em: 'live on stage', desc: 'Students performed traditional acts from across the globe at SEGi\'s biggest international event of the year.', btn1: 'View clubs', btn2: 'Join SISS', route1: '/clubs', route2: '/clubs' },
  { img: '/photos/IMG_3064.PNG', bg: '#3C3489', tag: '📸 Photography Club · SEGI VMAC', title: 'Campus life', em: 'through a lens', desc: 'From golden hour shoots to club events — our Photography Club captures every moment on campus.', btn1: 'View gallery', btn2: 'Join the club', route1: '/clubs', route2: '/clubs' },
  { img: '/photos/IMG_3065.PNG', bg: '#6B3800', tag: '🐾 SUVC · Pawsitive Event', title: 'Real care,', em: 'real moments', desc: 'SEGI University Volunteer Community making a difference — one paw at a time.', btn1: 'View events', btn2: 'Volunteer', route1: '/events', route2: '/clubs' },
];

export default function Home() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const timerRef = useRef();

  useEffect(() => {
    getClubs().then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.clubs || []);
      setClubs(d.slice(0, 3));
    }).catch(() => {});

    getEvents().then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.events || []);
      setEvents(d.filter(e => new Date(e.eventDate) > new Date()).slice(0, 4));
    }).catch(() => {});

    fetch('http://localhost:5000/api/gallery/featured')
      .then(r => r.json())
      .then(d => setGallery(d.photos || []))
      .catch(() => {});
  }, []);

  const goSlide = (i) => { setSlide(i); clearInterval(timerRef.current); timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000); };

  const s = SLIDES[slide];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#EAF6FA' }}>

      {/* -- HERO SLIDER -- */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 440, background: s.bg, transition: 'background .65s' }}>
        <img src={s.img} alt="" style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${s.bg} 50%, transparent 100%)` }} />
        <div style={{ position: 'relative', zIndex: 3, padding: '3rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: 560 }}>
          <h1 style={{ color: '#fff', fontSize: '2.1rem', fontWeight: 500, lineHeight: 1.2, marginBottom: 10 }}>
            {s.title}<br /><em style={{ fontStyle: 'normal', color: '#7dd3f0' }}>{s.em}</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 14, lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: 420 }}>{s.desc}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(s.route1)} style={{ background: '#fff', color: '#0A6B8E', border: 'none', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{s.btn1}</button>
            <button onClick={() => navigate(s.route2)} style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.5)', padding: '10px 22px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>{s.btn2}</button>
          </div>
        </div>
        {/* Arrows */}
        <button onClick={() => goSlide((slide - 1 + SLIDES.length) % SLIDES.length)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
        <button onClick={() => goSlide((slide + 1) % SLIDES.length)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 20, left: '3.5rem', display: 'flex', gap: 8, zIndex: 10 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: i === slide ? 4 : '50%', background: i === slide ? '#fff' : 'rgba(255,255,255,.35)', border: 'none', cursor: 'pointer', padding: 0, transition: '.25s' }} />
          ))}
        </div>
      </div>

      {/* -- STATS BAR -- */}
      <div style={{ background: '#0A6B8E', display: 'flex' }}>
        {[['25,000+', 'Students across all campuses'], ['48', 'Active clubs & societies'], ['120+', 'Events this year'], ['85', 'Nationalities on campus'], ['QS 5★+', 'Ranked #701–710 globally']].map(([n, l]) => (
          <div key={l} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,.18)' }}>
            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 500 }}>{n}</div>
            <div style={{ color: 'rgba(255,255,255,.62)', fontSize: 11, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* -- CAMPUS HIGHLIGHTS GALLERY -- */}
      <div style={{ padding: '2.5rem 3rem', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '.5rem' }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: '#111' }}>Campus highlights</p>
          <span onClick={() => navigate('/clubs')} style={{ fontSize: 13, color: '#0A6B8E', cursor: 'pointer' }}>View all →</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>Moments from our clubs & events</p>
        {gallery.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '2rem 0' }}>No highlights yet — check back soon!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {gallery.map((g) => (
              <div key={g.galleryID} style={{
                position: 'relative', borderRadius: 12, overflow: 'hidden',
                cursor: 'pointer', aspectRatio: '1 / 1'
              }}>
                <img src={g.imageUrl} alt={g.caption || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s' }}
                  onError={e => { e.target.parentElement.style.background = '#0A6B8E'; e.target.style.display = 'none'; }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
               <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.55))', padding: '12px 14px 14px' }}>
  {g.clubName && (
    <div style={{ display: 'inline-block', background: 'rgba(10,107,142,0.85)', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
      {g.clubName}
    </div>
  )}
</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -- FEATURED CLUBS -- */}
      {clubs.length > 0 && (
        <div style={{ padding: '2.5rem 3rem', background: '#f0f9fc' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: 17, fontWeight: 500, color: '#111' }}>Featured clubs</p>
            <span onClick={() => navigate('/clubs')} style={{ fontSize: 13, color: '#0A6B8E', cursor: 'pointer' }}>View all →</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>Join a club and find your people</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {clubs.map(club => (
              <div key={club.clubID} onClick={() => navigate(`/clubs/${club.clubID}`)}
                style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', padding: '18px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,107,142,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#EAF6FA', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid #e5e7eb' }}>
                    {club.profilePicUrl
                      ? <img src={club.profilePicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      : '🏛️'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>{club.clubName}</p>
                    <p style={{ fontSize: 12, color: '#0A6B8E', fontWeight: 500, margin: '2px 0 0' }}>{club.category}</p>
                  </div>
                </div>
                {club.description && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{club.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -- UPCOMING EVENTS -- */}
      {events.length > 0 && (
        <div style={{ padding: '2.5rem 3rem', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: 17, fontWeight: 500, color: '#111' }}>Upcoming events</p>
            <span onClick={() => navigate('/events')} style={{ fontSize: 13, color: '#0A6B8E', cursor: 'pointer' }}>View all →</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>Don't miss out on what's happening</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {events.map(ev => (
              <div key={ev.eventID} onClick={() => navigate('/events')}
                style={{ background: '#f0f9fc', borderRadius: 14, border: '0.5px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: 130, background: 'linear-gradient(135deg,#084D68,#0A6B8E)', position: 'relative', overflow: 'hidden' }}>
                  {ev.imageUrl && <img src={ev.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: '#0A6B8E', borderRadius: 8, padding: '5px 10px', textAlign: 'center', minWidth: 44 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: 1 }}>{new Date(ev.eventDate).getDate()}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.85)', marginTop: 1 }}>{new Date(ev.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: '#0A6B8E', fontWeight: 500 }}>{ev.clubName}</p>
                  {ev.venue && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>📍 {ev.venue}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -- AI BAND -- */}
      <div style={{ background: '#0A6B8E', padding: '1.5rem 3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,.9)' }}>🤖</div>
          <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 500, marginTop: 4 }}>Need help? Ask our AI</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Instant answers about clubs, events & campus life</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {['Which club should I join?', 'Events this week?', 'How do I register?', 'Upcoming tournaments?', 'What is SISS?'].map(q => (
            <span key={q} onClick={() => navigate('/chatbot')} style={{ background: 'rgba(255,255,255,.14)', color: '#EAF6FA', border: '1px solid rgba(255,255,255,.22)', borderRadius: 16, padding: '6px 13px', fontSize: 12, cursor: 'pointer' }}>{q}</span>
          ))}
        </div>
        <button onClick={() => navigate('/chatbot')} style={{ background: '#fff', color: '#0A6B8E', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>Ask AI</button>
      </div>

      {/* -- FOOTER -- */}
      <footer style={{ background: '#084D68', padding: '3rem 3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <SEGiLogo />
              <div>
                <p style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>SEGi University</p>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>Community Hub</p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12.5, lineHeight: 1.8 }}>9, Jalan Teknologi, Taman Sains Selangor,<br />Kota Damansara, 47810 Petaling Jaya,<br />Selangor Darul Ehsan, Malaysia</p>
            <div style={{ marginTop: 12 }}>
              <p style={{ color: '#7dd3f0', fontSize: 11, fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.4px' }}>Contact</p>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 12.5, lineHeight: 1.75 }}>+603 6145 1777</p>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 12.5 }}>info@segi.edu.my</p>
            </div>
          </div>
          {[
            { title: 'Community Hub', links: ['Home', 'Club directory', 'Events', 'Notifications', 'AI assistant'] },
            { title: 'Student Life', links: ['Clubs & societies', 'Sports', 'Arts & culture', 'Volunteering', 'SRC'] },
            { title: 'University', links: ['About SEGi', 'Admissions', 'Programmes', 'Scholarships', 'Contact us'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ color: '#7dd3f0', fontSize: 11, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>{col.title}</p>
              {col.links.map(l => <p key={l} style={{ color: 'rgba(255,255,255,.62)', fontSize: 12.5, marginBottom: 8, cursor: 'pointer' }}>{l}</p>)}
            </div>
          ))}
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(255,255,255,.12)', marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 12 }}>© 2026 SEGi University & Colleges — Community Hub · Built by Lydia Tolulope Omosofe</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Privacy policy', 'Terms of use', 'Accessibility'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,.38)', fontSize: 12, cursor: 'pointer' }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}