import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClubs } from '../services/api';
import { Search } from 'lucide-react';

const CAT_COLORS = {
  Hobby:      { bg: '#FAEEDA', text: '#633806' },
  Cultural:   { bg: '#EEEDFE', text: '#3C3489' },
  Academic:   { bg: '#EAF6FA', text: '#084D68' },
  Sports:     { bg: '#E1F5EE', text: '#085041' },
  Volunteer:  { bg: '#FAECE7', text: '#712B13' },
  Community:  { bg: '#FEF3C7', text: '#92400E' },
  Arts:       { bg: '#FBEAF0', text: '#72243E' },
};

export default function ClubDirectory() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClubs().then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.clubs || []);
      setClubs(d);
    }).catch(() => {}).finally(() => setLoading(false));
fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/gallery/featured-club-page`)
  .then(r => r.json())
  .then(d => setGallery(d.photos || []))
  .catch(() => {});
}, []);

const categories = ['All', ...Array.from(new Set(clubs.map(c => c.category).filter(Boolean)))];
  const filtered = clubs.filter(c => {
    const matchCat = activeFilter === 'All' || c.category === activeFilter;
    const matchSearch = !search ||
      (c.clubName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f0f9fc', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg,#084D68 0%,#0A6B8E 100%)', padding: '2.75rem 3rem 2.25rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 500, marginBottom: 6 }}>Club Directory</h1>
        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14, marginBottom: '1.75rem' }}>
          Discover clubs and societies at SEGi University Kota Damansara
        </p>

        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '0 16px', height: 48, maxWidth: 480, gap: 10, marginBottom: 14 }}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clubs by name, category or interest..."
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1, background: 'transparent', color: '#111' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <span key={cat} onClick={() => setActiveFilter(cat)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              fontWeight: 500, whiteSpace: 'nowrap', transition: '.15s',
              background: activeFilter === cat ? '#fff' : 'rgba(255,255,255,.1)',
              color: activeFilter === cat ? '#0A6B8E' : 'rgba(255,255,255,.85)',
              border: activeFilter === cat ? '1.5px solid #fff' : '1.5px solid rgba(255,255,255,.35)'
            }}>{cat}</span>
          ))}
        </div>
      </div>

      {/* ── CLUB MOMENTS ── */}
      {!search && gallery.length > 0 && (
        <div style={{ padding: '2rem 3rem 0', background: '#f0f9fc' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>Club moments</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>A glimpse into what our clubs get up to</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {gallery.slice(0, 6).map((p) => (
              <div key={p.galleryID} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 155, cursor: 'pointer' }}>
                <img src={p.imageUrl} alt={p.caption || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', transition: 'transform .35s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  onError={e => { e.target.parentElement.style.background = '#0A6B8E'; e.target.style.display = 'none'; }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.55))', padding: '6px 8px 8px' }}>
                  {p.clubName && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.8)', fontWeight: 600, marginBottom: 2 }}>{p.clubName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLUBS GRID ── */}
      <div style={{ padding: '2.5rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>
            All clubs <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>{filtered.length} clubs</span>
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>Loading clubs…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏛️</div>
            <p>No clubs found matching your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>
            {filtered.map(club => {
              const catStyle = CAT_COLORS[club.category] || { bg: '#EAF6FA', text: '#084D68' };
              return (
                <div key={club.clubID}
                  style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,107,142,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onClick={() => navigate(`/clubs/${club.clubID}`)}>

                 <div style={{ background: '#EAF6FA', padding: '24px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      border: '2px solid #e5e7eb', overflow: 'hidden',
                      background: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24
                    }}>
                      {club.profilePicUrl
                        ? <img src={club.profilePicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        : <span style={{ color: '#9ca3af' }}>🏛️</span>
                      }
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 8px', lineHeight: 1.3 }}>{club.clubName}</p>
                    {club.category && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: catStyle.bg, color: catStyle.text, borderRadius: 20, padding: '4px 12px', display: 'inline-block', marginBottom: 12 }}>{club.category}</span>
                    )}
                    {club.description && (
                      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{club.description}</p>
                    )}
                    <button
                      style={{ background: '#0A6B8E', color: '#fff', border: 'none', padding: '9px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', width: '100%' }}
                      onMouseEnter={e => e.target.style.background = '#084D68'}
                      onMouseLeave={e => e.target.style.background = '#0A6B8E'}
                    >View club →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}