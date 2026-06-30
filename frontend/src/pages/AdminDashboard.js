import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const CLOUD_NAME = 'dhzxwmkfk';
const UPLOAD_PRESET = 'qsrxxrar';

// ─── CLOUDINARY IMAGE UPLOADER ───────────────────────────────────
const ImageUpload = ({ label, hint, value, onChange, round }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, fd
      );
      onChange(res.data.secure_url);
    } catch {
      setError('Upload failed. Check your Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#334155' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{hint}</p>}

      {/* Preview */}
      {value && (
        <div style={{ marginBottom: 8 }}>
          <img src={value} alt="preview"
            style={{ width: round ? 70 : '100%', height: round ? 70 : 90, objectFit: 'cover', borderRadius: round ? '50%' : 8, display: 'block' }}
            onError={e => e.target.style.display = 'none'} />
        </div>
      )}

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => inputRef.current.click()} disabled={uploading}
          style={{
            background: uploading ? '#e2e8f0' : '#0097A7', color: uploading ? '#64748b' : '#fff',
            border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 13,
            fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer'
          }}>
          {uploading ? '⏳ Uploading…' : '📁 Upload from PC'}
        </button>

        {/* Manual URL fallback */}
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder="or paste image URL here"
          style={{ flex: 1, minWidth: 140, padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: 13 }}
        />
      </div>

      {error && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#e53e3e' }}>{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
};

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const C = {
  teal:      '#0097A7',
  tealDark:  '#006978',
  tealLight: '#E0F7FA',
  navy:      '#1a3c5e',
  white:     '#ffffff',
  gray50:    '#f8fafc',
  gray100:   '#f1f5f9',
  gray200:   '#e2e8f0',
  gray500:   '#64748b',
  gray700:   '#334155',
  red:       '#e53e3e',
};

const TABS = [
  { id: 'clubs',         label: 'Clubs' },
  { id: 'events',        label: 'Events' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'gallery',       label: 'Club Gallery' },
];

// ─── SHARED ────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem'
  }}>
    <div style={{
      background:C.white, borderRadius:16, padding:'1.75rem',
      width:'100%', maxWidth:560, boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
      maxHeight:'90vh', overflowY:'auto'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.navy }}>{title}</h2>
        <button onClick={onClose} style={{
          background:C.gray100, border:'none', borderRadius:'50%',
          width:32, height:32, cursor:'pointer', fontSize:18, color:C.gray500,
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, type='text', value, onChange, placeholder, required, rows }) => (
  <div style={{ marginBottom:'1rem' }}>
    <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5, color:C.gray700 }}>
      {label}{required && <span style={{ color:C.red }}> *</span>}
    </label>
    {type==='textarea' ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows||3}
        style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} />
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, boxSizing:'border-box' }} />
    )}
  </div>
);

const Badge = ({ children, color='gray' }) => {
  const map = { teal:[C.tealLight,C.tealDark], blue:['#dbeafe','#1e40af'], green:['#dcfce7','#166534'], amber:['#fef3c7','#92400e'], red:['#fee2e2','#991b1b'], purple:['#ede9fe','#5b21b6'], gray:[C.gray100,C.gray500] };
  const [bg,text] = map[color]||map.gray;
  return <span style={{ background:bg, color:text, borderRadius:6, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{children}</span>;
};

const Btn = ({ onClick, variant='primary', disabled, children, small }) => {
  const s = {
    primary:   { background:C.teal,   color:C.white, border:'none' },
    secondary: { background:C.white,  color:C.navy,  border:`1.5px solid ${C.gray200}` },
    danger:    { background:C.white,  color:C.red,   border:`1.5px solid ${C.red}` },
    navy:      { background:C.navy,   color:C.white, border:'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s[variant], borderRadius:8,
      padding: small ? '5px 12px' : '9px 18px',
      fontSize: small ? 13 : 14, fontWeight:600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1
    }}>{children}</button>
  );
};

// ─── CLUBS TAB ─────────────────────────────────────────────────────

const defaultClub = { clubName:'', description:'', category:'', contactEmail:'', membershipLink:'', profilePicUrl:'' };

const ClubsTab = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultClub);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await API.get('/clubs'); setClubs(Array.isArray(r.data) ? r.data : (r.data?.clubs || [])); }
    catch { setError('Could not load clubs. Is the backend running?'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(defaultClub); setModal(true); };
  const openEdit = (c) => {
    setEditing(c.clubID);
    setForm({ clubName:c.clubName||'', description:c.description||'', category:c.category||'', contactEmail:c.contactEmail||'', membershipLink:c.membershipLink||'', profilePicUrl:c.profilePicUrl||'' });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      editing ? await API.put(`/clubs/${editing}`, form) : await API.post('/clubs', form);
      setModal(false); load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      setError(`Failed to save club: ${msg}`);
    }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this club permanently?')) return;
    try { await API.delete(`/clubs/${id}`); load(); }
    catch { setError('Delete failed.'); }
  };

  const f = (k) => ({ value:form[k], onChange:(e) => setForm(p=>({...p,[k]:e.target.value})) });
  const catColor = { Hobby:'amber', Cultural:'purple', Academic:'blue', Sports:'green', Technology:'teal' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.navy }}>Clubs</h2>
          <p style={{ margin:'2px 0 0', fontSize:13, color:C.gray500 }}>{clubs.length} club{clubs.length!==1?'s':''} registered</p>
        </div>
        <Btn onClick={openCreate} variant="navy">+ Add Club</Btn>
      </div>

      {error && <div style={{ background:'#fee2e2', color:C.red, padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13 }}>{error}</div>}

      {loading ? (
        <p style={{ color:C.gray500, textAlign:'center', padding:'3rem' }}>Loading clubs…</p>
      ) : clubs.length===0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:C.gray500 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🏛️</div>
          <p style={{ margin:0 }}>No clubs yet. Add the first one!</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
          {clubs.map(club => (
            <div key={club.id} style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ position:'relative', height:100 }}>
                {club.bannerUrl
                  ? <img src={club.bannerUrl} alt="banner" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                  : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg, ${C.teal}, ${C.navy})` }} />
                }
                <div style={{ position:'absolute', bottom:-20, left:14, width:40, height:40, borderRadius:'50%', border:`2.5px solid ${C.white}`, overflow:'hidden', background:C.tealLight }}>
                  {club.profilePicUrl
                    ? <img src={club.profilePicUrl} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏛️</div>
                  }
                </div>
              </div>
              <div style={{ padding:'28px 16px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.navy }}>{club.clubName}</h3>
                    <p style={{ margin:'3px 0 0', fontSize:12, color:C.gray500 }}>{club.contactEmail||'—'}</p>
                  </div>
                  <Badge color={catColor[club.category]||'gray'}>{club.category||'—'}</Badge>
                </div>
                {club.description && <p style={{ margin:'10px 0 0', fontSize:13, color:C.gray700, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{club.description}</p>}
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <Btn small variant="secondary" onClick={()=>openEdit(club)}>Edit</Btn>
                  <Btn small variant="danger" onClick={()=>del(club.clubID)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing?'Edit Club':'Add New Club'} onClose={()=>setModal(false)}>
          <Field label="Club Name" {...f('clubName')} placeholder="e.g. SEGI Photography Club" required />
          <Field label="Category" {...f('category')} placeholder="Hobby / Cultural / Academic / Sports / Technology" required />
          <Field label="Description" type="textarea" {...f('description')} placeholder="What is this club about?" />
          <Field label="Contact (Instagram handle)" {...f('contactEmail')} placeholder="@clubhandle" />
          <Field label="Membership Link" {...f('membershipLink')} placeholder="https://forms.gle/..." />

          <div style={{ background:C.gray50, borderRadius:10, padding:'14px', marginBottom:'1rem', border:`1px solid ${C.gray200}` }}>
            <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:C.navy }}>🖼️ Club Images</p>
            <ImageUpload label="Profile Picture" hint="Square logo or photo — shown as a circle on the club card" value={form.profilePicUrl} onChange={url => setForm(p=>({...p, profilePicUrl:url}))} round={true} />
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:4 }}>
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn variant="navy" onClick={save} disabled={saving||!form.clubName.trim()}>{saving?'Saving…':editing?'Save Changes':'Create Club'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── EVENTS TAB ────────────────────────────────────────────────────

const defaultEvent = { title:'', description:'', venue:'', eventDate:'', clubID:'', imageUrl:'' };

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultEvent);
  const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
  setLoading(true);
  try {
    const [e, c] = await Promise.all([API.get('/events'), API.get('/clubs')]);
    const eventsArr = Array.isArray(e.data) ? e.data : (e.data?.events || []);
    const now = new Date();
    const sorted = [...eventsArr].sort((a, b) => {
      const aUp = new Date(a.eventDate) > now;
      const bUp = new Date(b.eventDate) > now;
      if (aUp && !bUp) return -1;
      if (!aUp && bUp) return 1;
      if (aUp && bUp) return new Date(a.eventDate) - new Date(b.eventDate);
      return new Date(b.eventDate) - new Date(a.eventDate);
    });
    setEvents(sorted);
    setClubs(Array.isArray(c.data) ? c.data : (c.data?.clubs || []));
  }
  catch { setError('Could not load events.'); }
  finally { setLoading(false); }
}, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(defaultEvent); setModal(true); };
  const openEdit = (ev) => {
    setEditing(ev.eventID);
    setForm({ title:ev.title||'', description:ev.description||'', venue:ev.venue||'', eventDate:ev.eventDate?ev.eventDate.slice(0,16):'', clubID:ev.clubID||'', imageUrl:ev.imageUrl||'' });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, clubID: form.clubID || null };
      editing ? await API.put(`/events/${editing}`, payload) : await API.post('/events', payload);
      setModal(false); load();
    } catch { setError('Failed to save event.'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await API.delete(`/events/${id}`); load(); }
    catch { setError('Delete failed.'); }
  };

  const f = (k) => ({ value:form[k], onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });
const clubName = (id) => clubs.find(c=>c.clubID===id)?.clubName || 'General';
  const fmt = (d) => d?new Date(d).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}):'—';
  const upcoming = (d) => d&&new Date(d)>new Date();

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.navy }}>Events</h2>
          <p style={{ margin:'2px 0 0', fontSize:13, color:C.gray500 }}>{events.length} event{events.length!==1?'s':''} total</p>
        </div>
        <Btn onClick={openCreate} variant="navy">+ Add Event</Btn>
      </div>

      {error && <div style={{ background:'#fee2e2', color:C.red, padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13 }}>{error}</div>}

      {loading ? (
        <p style={{ color:C.gray500, textAlign:'center', padding:'3rem' }}>Loading events…</p>
      ) : events.length===0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:C.gray500 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🗓️</div>
          <p style={{ margin:0 }}>No events yet. Create the first one!</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ height:140, background:`linear-gradient(135deg, ${C.tealDark}, ${C.navy})`, position:'relative' }}>
                {ev.imageUrl && <img src={ev.imageUrl} alt="event" style={{ width:'100%', height:'100%', objectFit:'contain', background:'#f1f5f9' }} onError={e=>e.target.style.display='none'} />}
                <div style={{ position:'absolute', top:10, right:10 }}>
                  <Badge color={upcoming(ev.eventDate)?'green':'gray'}>{upcoming(ev.eventDate)?'Upcoming':'Past'}</Badge>
                </div>
              </div>
              <div style={{ padding:16 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.navy }}>{ev.title}</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:C.teal, fontWeight:600 }}>{clubName(ev.clubID)}</p>
                <p style={{ margin:'6px 0 0', fontSize:12, color:C.gray500 }}>📅 {fmt(ev.eventDate)}</p>
                {ev.venue && <p style={{ margin:'2px 0 0', fontSize:12, color:C.gray500 }}>📍 {ev.venue}</p>}
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <Btn small variant="secondary" onClick={()=>openEdit(ev)}>Edit</Btn>
                  <Btn small variant="danger" onClick={()=>del(ev.eventID)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing?'Edit Event':'Add New Event'} onClose={()=>setModal(false)}>
          <Field label="Event Title" {...f('title')} placeholder="e.g. Annual Art Exhibition" required />
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5, color:C.gray700 }}>Club</label>
            <select value={form.clubID} onChange={e=>setForm(p=>({...p,clubID:e.target.value}))}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14 }}>
              <option value="">— No club (class / general event) —</option>
              {clubs.map(c=><option key={c.clubID} value={c.clubID}>{c.clubName}</option>)}
            </select>
          </div>
          <Field label="Event Date & Time" type="datetime-local" {...f('eventDate')} required />
          <Field label="Venue" {...f('venue')} placeholder="e.g. SEGI Hall B, Block A" />
          <Field label="Description" type="textarea" {...f('description')} placeholder="What will happen at this event?" />

          <div style={{ background:C.gray50, borderRadius:10, padding:'14px', marginBottom:'1rem', border:`1px solid ${C.gray200}` }}>
            <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:C.navy }}>🖼️ Event Cover Image</p>
            <ImageUpload label="Cover Photo" hint="An eye-catching image that makes students excited to attend" value={form.imageUrl} onChange={url => setForm(p=>({...p, imageUrl:url}))} />
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:4 }}>
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn variant="navy" onClick={save} disabled={saving||!form.title.trim()}>{saving?'Saving…':editing?'Save Changes':'Create Event'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── NOTIFICATIONS TAB ─────────────────────────────────────────────

const defaultNotif = { message:'', type:'info', title:'' };

const NotificationsTab = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(defaultNotif);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await API.get('/notifications'); setNotifs(Array.isArray(r.data) ? r.data : (r.data?.notifications || [])); }
    catch { setError('Could not load notifications.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

 const send = async () => {
  setSaving(true);
  try { 
    await API.post('/notifications', form); 
    setModal(false); 
    setForm(defaultNotif); 
    load(); 
  } catch (err) { 
    setError(err?.response?.data?.message || err.message || 'Failed to send.'); 
  }
  finally { setSaving(false); }
};

  const del = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await API.delete(`/notifications/${id}`); load(); }
    catch { setError('Delete failed.'); }
  };

  const typeMap = { info:['blue','ℹ️'], warning:['amber','⚠️'], success:['green','✅'], danger:['red','🚨'] };
  const fmt = (d) => d?new Date(d).toLocaleString('en-MY',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—';

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.navy }}>Notifications</h2>
          <p style={{ margin:'2px 0 0', fontSize:13, color:C.gray500 }}>{notifs.length} total</p>
        </div>
        <Btn onClick={()=>setModal(true)} variant="navy">+ Send Notification</Btn>
      </div>

      {error && <div style={{ background:'#fee2e2', color:C.red, padding:'10px 14px', borderRadius:8, marginBottom:12, fontSize:13 }}>{error}</div>}

      {loading ? <p style={{ color:C.gray500, textAlign:'center', padding:'3rem' }}>Loading…</p>
      : notifs.length===0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:C.gray500 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔔</div>
          <p style={{ margin:0 }}>No notifications sent yet.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {notifs.map(n => {
            const [color,icon] = typeMap[n.type]||['gray','📢'];
            return (
              <div key={n.id} style={{
                background:n.isRead?C.gray50:C.white,
                border:`1.5px solid ${n.isRead?C.gray200:C.tealLight}`,
                borderLeft:`4px solid ${n.isRead?C.gray200:C.teal}`,
                borderRadius:10, padding:'14px 16px',
                display:'flex', justifyContent:'space-between', alignItems:'flex-start'
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span>{icon}</span>
                    <Badge color={color}>{n.type||'info'}</Badge>
                    {!n.isRead && <Badge color="teal">New</Badge>}
                    <span style={{ fontSize:12, color:C.gray500 }}>{fmt(n.createdAt)}</span>
                  </div>
                  <p style={{ margin:0, fontSize:14, color:C.gray700, lineHeight:1.6 }}>{n.message}</p>
                </div>
                <Btn small variant="danger" onClick={()=>del(n.notifID || n.notificationID || n.id)}>Delete</Btn>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Send Notification to Students" onClose={()=>setModal(false)}>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5, color:C.gray700 }}>Type</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['info','warning','success','danger'].map(t=>(
                <button key={t} onClick={()=>setForm(p=>({...p,type:t}))} style={{
                  padding:'6px 14px', borderRadius:7, fontSize:13, cursor:'pointer', fontWeight:600,
                  background:form.type===t?C.teal:C.gray100,
                  color:form.type===t?C.white:C.gray700,
                  border:form.type===t?`1.5px solid ${C.teal}`:`1.5px solid ${C.gray200}`
                }}>{typeMap[t][1]} {t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
            </div>
          </div>
          <Field label="Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. New event announcement" />
          <Field label="Message" type="textarea" rows={4}
            value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
            placeholder="Write your message to all students…" required />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:4 }}>
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn variant="navy" onClick={send} disabled={saving||!form.message.trim()}>{saving?'Sending…':'Send to All Students'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── GALLERY TAB ───────────────────────────────────────────────────

const GalleryTab = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    API.get('/clubs').then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data?.clubs || []);
      setClubs(d);
    });
  }, []);

  useEffect(() => {
    if (!selectedClub) return;
    API.get(`/gallery/${selectedClub}`).then(r => setPhotos(r.data?.photos || [])).catch(() => {});
  }, [selectedClub]);

  const handleUpload = async (file) => {
    if (!selectedClub) { setError('Please select a club first.'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'qsrxxrar');
      const up = await axios.post('https://api.cloudinary.com/v1_1/dhzxwmkfk/image/upload', fd);
      await API.post('/gallery', { clubID: selectedClub, imageUrl: up.data.secure_url, caption });
      setCaption('');
      setSuccess('Photo added!');
      const r = await API.get(`/gallery/${selectedClub}`);
      setPhotos(r.data?.photos || []);
    } catch { setError('Upload failed.'); }
    finally { setUploading(false); }
  };

  const deletePhoto = async (galleryID) => {
    if (!window.confirm('Remove this photo?')) return;
    try {
      await API.delete(`/gallery/${galleryID}`);
      setPhotos(prev => prev.filter(p => p.galleryID !== galleryID));
    } catch { setError('Delete failed.'); }
  };

  const toggleFeatured = async (photo) => {
    setTogglingId(photo.galleryID);
    try {
      await API.patch(`/gallery/${photo.galleryID}/featured`, { featured: !photo.featured });
      setPhotos(prev => prev.map(p =>
        p.galleryID === photo.galleryID ? { ...p, featured: p.featured ? 0 : 1 } : p
      ));
    } catch { setError('Could not update featured status.'); }
    finally { setTogglingId(null); }
  };

  const toggleFeaturedClubPage = async (photo) => {
  setTogglingId(photo.galleryID);
  try {
    await API.patch(`/gallery/${photo.galleryID}/featuredClubPage`, { featured: !photo.featuredClubPage });
    setPhotos(prev => prev.map(p =>
      p.galleryID === photo.galleryID ? { ...p, featuredClubPage: p.featuredClubPage ? 0 : 1 } : p
    ));
  } catch { setError('Could not update club page featured status.'); }
  finally { setTogglingId(null); }
};

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: C.navy }}>Club Gallery</h2>
        <p style={{ margin: 0, fontSize: 13, color: C.gray500 }}>
          Upload photos and ⭐ star them to feature on the homepage Campus Highlights
        </p>
      </div>

      {/* Club selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.gray700, marginBottom: 6 }}>Select Club</label>
        <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${C.gray200}`, fontSize: 14, minWidth: 280 }}>
          <option value="">— Choose a club —</option>
          {clubs.map(c => <option key={c.clubID} value={c.clubID}>{c.clubName}</option>)}
        </select>
      </div>

      {selectedClub && (
        <>
          {/* Upload area */}
          <div style={{ background: C.gray50, borderRadius: 10, padding: '16px', marginBottom: '1.25rem', border: `1.5px dashed ${C.gray200}` }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: C.navy }}>Add a photo</p>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Caption (optional)" style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: `1.5px solid ${C.gray200}`, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
            <Btn variant="navy" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : '📁 Upload Photo from PC'}
            </Btn>
            {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#e53e3e' }}>{error}</p>}
            {success && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#16a34a' }}>{success}</p>}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', width: 'fit-content' }}>
            <span style={{ fontSize: 15 }}>⭐</span>
            <p style={{ margin: 0, fontSize: 12, color: '#92400e', fontWeight: 500 }}>
              Star a photo to feature it in Campus Highlights on the homepage
            </p>
          </div>

          {/* Photo grid */}
          {photos.length === 0 ? (
            <p style={{ color: C.gray500, textAlign: 'center', padding: '2rem' }}>No photos yet for this club.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {photos.map(photo => (
                <div key={photo.galleryID} style={{
                  position: 'relative', borderRadius: 10, overflow: 'hidden',
                  border: photo.featured ? '2.5px solid #f59e0b' : `1px solid ${C.gray200}`,
                  boxShadow: photo.featured ? '0 0 0 3px rgba(245,158,11,0.15)' : 'none',
                  transition: 'border .2s, box-shadow .2s'
                }}>
                  <div style={{ paddingBottom: '75%', position: 'relative', background: C.gray100 }}>
                    <img src={photo.imageUrl} alt={photo.caption || ''}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'} />
                  </div>

                  {/* Featured badge */}
                  {photo.featured ? (
                    <div style={{ position: 'absolute', top: 6, left: 6, background: '#f59e0b', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      ⭐ Featured
                    </div>
                  ) : null}

                  {/* Caption */}
                  {photo.caption && (
                    <p style={{ margin: 0, fontSize: 11, color: C.gray700, padding: '6px 8px', background: '#fff' }}>{photo.caption}</p>
                  )}

                  {/* Action buttons */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 8px', background: C.gray50, borderTop: `1px solid ${C.gray200}` }}>
  <div style={{ display: 'flex', gap: 4 }}>
    <button
      onClick={() => toggleFeatured(photo)}
      disabled={togglingId === photo.galleryID}
      title={photo.featured ? 'Remove from homepage' : 'Feature on homepage'}
      style={{
        flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
        background: photo.featured ? '#fef3c7' : C.gray100,
        color: photo.featured ? '#92400e' : C.gray500,
        opacity: togglingId === photo.galleryID ? 0.5 : 1
      }}>
      {photo.featured ? '⭐ Home' : '☆ Home'}
    </button>
    <button
      onClick={() => toggleFeaturedClubPage(photo)}
      disabled={togglingId === photo.galleryID}
      title={photo.featuredClubPage ? 'Remove from club directory' : 'Feature on club directory'}
      style={{
        flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
        background: photo.featuredClubPage ? '#dbeafe' : C.gray100,
        color: photo.featuredClubPage ? '#1e40af' : C.gray500,
        opacity: togglingId === photo.galleryID ? 0.5 : 1
      }}>
      {photo.featuredClubPage ? '⭐ Clubs' : '☆ Clubs'}
    </button>
  </div>
  <button onClick={() => deletePhoto(photo.galleryID)} style={{
    padding: '5px 8px', background: 'rgba(220,38,38,0.08)', color: '#dc2626',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%'
  }}>✕ Delete</button>
</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── MAIN DASHBOARD ────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('clubs');
  const [stats, setStats] = useState({ clubs: 0, events: 0, notifications: 0 });
  const [statsKey, setStatsKey] = useState(0);

  const refreshStats = () => setStatsKey(k => k + 1);

  useEffect(() => {
    (async () => {
      try {
        const [c, e, notifRes] = await Promise.all([API.get('/clubs'), API.get('/events'), API.get('/notifications/all')]);
const clubsArr = Array.isArray(c.data) ? c.data : (c.data?.clubs || []);
const eventsArr = Array.isArray(e.data) ? e.data : (e.data?.events || []);
const notifsArr = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.notifications || []);
setStats({ clubs: clubsArr.length, events: eventsArr.length, notifications: notifsArr.length });

      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    })();
  }, [statsKey]);

  const tabContent = { clubs:<ClubsTab/>, events:<EventsTab/>, notifications:<NotificationsTab/>, gallery:<GalleryTab/> };

  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:"'Segoe UI', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.tealDark} 60%, ${C.teal} 100%)`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:'40%', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem', position:'relative' }}>
          {/* Logo + SAP label row */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem' }}>
  <div style={{ width:1, height:36, background:'rgba(255,255,255,0.25)' }} />
  <div>
    <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600 }}>Community Hub</p>
    <p style={{ margin:'2px 0 0', fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>System Administrator Panel</p>
  </div>
</div>

          <h1 style={{ margin:'0 0 4px', fontSize:28, fontWeight:700, color:C.white, letterSpacing:'-0.01em' }}>Admin Dashboard</h1>
          <p style={{ margin:'0 0 1.75rem', fontSize:14, color:'rgba(255,255,255,0.65)' }}>Manage clubs, events, and student notifications from one place.</p>

          {/* Stats — no emojis, clean */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label:'Total Clubs',    value: stats.clubs },
              { label:'Total Events',   value: stats.events },
              { label:'Notifications',  value: stats.notifications },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', borderRadius:10, padding:'12px 24px', border:'1px solid rgba(255,255,255,0.15)', minWidth:120 }}>
                <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}>{s.label}</p>
                <p style={{ margin:'5px 0 0', fontSize:28, fontWeight:700, color:C.white }}>{s.value === null ? '—' : s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background:C.white, borderBottom:`1.5px solid ${C.gray200}`, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 1.5rem', display:'flex', gap:4 }}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              padding:'14px 20px', border:'none', background:'none', cursor:'pointer',
              fontSize:14, fontWeight:activeTab===tab.id?700:400,
              color:activeTab===tab.id?C.teal:C.gray500,
              borderBottom:activeTab===tab.id?`2.5px solid ${C.teal}`:'2.5px solid transparent',
              whiteSpace:'nowrap'
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default AdminDashboard;
