import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useWindowSize } from '../hooks/useWindowSize';

const getUser = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };
const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

const linkify = (text) => {
  if (!text) return null;
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>
      : <span key={i}>{part}</span>
  );
};

const QUICK = [
  { label: '📅 Events', text: 'What events are coming up?' },
  { label: '🏛️ Clubs', text: 'Show me all clubs' },
  { label: '🔔 Notifications', text: 'How do I get notifications from clubs?' },
  { label: '📋 Registration', text: 'How do I register for a club?' },
  { label: '❤️ Volunteer', text: 'Tell me about volunteering clubs' },
];

export default function Chatbot() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { isMobile } = useWindowSize();
  const user = getUser();
  const sessionID = useRef(`session_${Date.now()}`);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const userKey = `chatHistory_${user.userID || 'guest'}`;
  const historyKey = `chatSessions_${user.userID || 'guest'}`;

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const sidebarBg = darkMode ? '#1e293b' : '#fff';
  const sidebarBorder = darkMode ? '#334155' : '#e5e7eb';
  const chatBg = darkMode ? '#0f172a' : '#f8fafc';
  const inputAreaBg = darkMode ? '#1e293b' : '#fff';
  const inputBorder = darkMode ? '#334155' : '#e5e7eb';
  const textPrimary = darkMode ? '#f1f5f9' : '#111';
  const textSecondary = darkMode ? '#94a3b8' : '#6b7280';
  const userBubble = '#0A6B8E';
  const aiBubble = darkMode ? '#1e293b' : '#fff';
  const aiBubbleBorder = darkMode ? '#334155' : '#e5e7eb';
  const aiBubbleText = darkMode ? '#e2e8f0' : '#1e293b';

  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(userKey) || '[]'); } catch { return []; }
  });
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const saveSession = (msgs) => {
    if (!msgs.length) return;
    const first = msgs.find(m => m.role === 'user');
    const title = first?.content?.slice(0, 40) || 'Chat';
    const updated = [{ id: sessionID.current, title, date: new Date().toISOString(), messages: msgs }, ...sessions.filter(s => s.id !== sessionID.current)].slice(0, 20);
    setSessions(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
    localStorage.setItem(userKey, JSON.stringify(msgs));
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg, time: new Date().toISOString() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const r = await sendChatMessage({ message: msg, sessionID: sessionID.current });
      const reply = [...newMessages, { role: 'assistant', content: r.data.response, time: new Date().toISOString() }];
      setMessages(reply);
      saveSession(reply);
    } catch {
      const err = [...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please check your connection and try again.', time: new Date().toISOString() }];
      setMessages(err);
    } finally { setLoading(false); }
  };

  const newChat = () => {
    if (messages.length) saveSession(messages);
    sessionID.current = `session_${Date.now()}`;
    setMessages([]);
    localStorage.setItem(userKey, '[]');
    setSidebarOpen(false);
  };

  const loadSession = (s) => {
    saveSession(messages);
    sessionID.current = s.id;
    setMessages(s.messages);
    localStorage.setItem(userKey, JSON.stringify(s.messages));
    setSidebarOpen(false);
  };

  const fmt = (d) => { try { const dd = new Date(d); if (isNaN(dd.getTime())) return ''; return dd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
  const fmtDate = (d) => {
    try {
      const dd = new Date(d);
      if (isNaN(dd.getTime())) return 'Recent';
      const today = new Date();
      const diff = Math.floor((today - dd) / 86400000);
      return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : dd.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    } catch { return 'Recent'; }
  };

  const grouped = sessions.reduce((acc, s) => { const k = fmtDate(s.date); if (!acc[k]) acc[k] = []; acc[k].push(s); return acc; }, {});

  const SidebarContent = () => (
    <>
      <div style={{ padding: '1rem' }}>
        <button onClick={newChat} style={{ width: '100%', background: '#0A6B8E', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ New chat</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 1rem' }}>
        {messages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 8px', margin: '0 0 4px' }}>Today</p>
            <div style={{ background: darkMode ? '#0f172a' : '#EAF6FA', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>💬</span>
              <span style={{ fontSize: 13, color: '#0A6B8E', fontWeight: 600 }}>Current chat</span>
            </div>
          </div>
        )}
        {Object.entries(grouped).map(([date, group]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 8px', margin: '0 0 4px' }}>{date}</p>
            {group.map(s => (
              <div key={s.id} onClick={() => loadSession(s)} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, transition: '.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#0f172a' : '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: textSecondary }}>💬</span>
                  <span style={{ fontSize: 12.5, color: textPrimary, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        {sessions.length === 0 && messages.length === 0 && (
          <p style={{ fontSize: 12, color: textSecondary, padding: '8px', fontStyle: 'italic' }}>No conversations yet</p>
        )}
      </div>
      <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${sidebarBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0A6B8E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {getInitials(user.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Student'}</p>
          <p style={{ margin: 0, fontSize: 11, color: textSecondary }}>SEGi Student</p>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 66px)', fontFamily: "'Segoe UI', system-ui, sans-serif", background: bg, transition: 'background .3s', position: 'relative' }}>

      {/* ── SIDEBAR: fixed column on desktop, overlay on mobile ── */}
      {!isMobile ? (
        <div style={{ width: 240, background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'background .3s' }}>
          <SidebarContent />
        </div>
      ) : (
        sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: 280, background: sidebarBg, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,.2)' }}>
              <SidebarContent />
            </div>
          </>
        )
      )}

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: chatBg, transition: 'background .3s', minWidth: 0 }}>

        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', borderBottom: `1px solid ${sidebarBorder}`, display: 'flex', alignItems: 'center', gap: 12, background: sidebarBg, transition: 'background .3s' }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: darkMode ? '#0f172a' : '#EAF6FA', border: 'none', borderRadius: 8, width: 34, height: 34, fontSize: 16, cursor: 'pointer', flexShrink: 0, color: '#0A6B8E' }}>☰</button>
          )}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: darkMode ? '#0f172a' : '#EAF6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary }}>Hub Assistant</p>
            <p style={{ margin: 0, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />Online </p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '2rem 0.5rem' : '3rem 1rem' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>Hub Assistant</h2>
              <p style={{ fontSize: 14, color: textSecondary, marginBottom: '2rem' }}>Ask me about clubs, events, registration, or anything about SEGi campus life!</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
                {QUICK.map(q => (
                  <button key={q.text} onClick={() => send(q.text)} style={{ background: darkMode ? '#1e293b' : '#EAF6FA', color: '#0A6B8E', border: `1px solid ${darkMode ? '#334155' : '#bae0f0'}`, borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: '.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#0f172a' : '#d0edf7'}
                    onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#1e293b' : '#EAF6FA'}
                  >{q.label}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16, gap: 10, alignItems: 'flex-end' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: darkMode ? '#1e293b' : '#EAF6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: `1px solid ${aiBubbleBorder}` }}>🤖</div>
              )}
              <div style={{ maxWidth: isMobile ? '82%' : '72%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? userBubble : aiBubble,
                  color: m.role === 'user' ? '#fff' : aiBubbleText,
                  border: m.role === 'user' ? 'none' : `1px solid ${aiBubbleBorder}`,
                  fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', boxShadow: m.role === 'user' ? 'none' : '0 1px 4px rgba(0,0,0,.06)'
                }}>
                  {linkify(m.content)}
                </div>
                <p style={{ margin: '4px 6px 0', fontSize: 10, color: textSecondary, textAlign: m.role === 'user' ? 'right' : 'left' }}>{fmt(m.time)}</p>
              </div>
              {m.role === 'user' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0A6B8E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(user.name)}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16, gap: 10, alignItems: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: darkMode ? '#1e293b' : '#EAF6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: aiBubble, border: `1px solid ${aiBubbleBorder}`, display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0A6B8E', opacity: .5, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length > 0 && (
          <div style={{ padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.5rem', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {QUICK.map(q => (
              <button key={q.text} onClick={() => send(q.text)} style={{ background: darkMode ? '#1e293b' : '#EAF6FA', color: '#0A6B8E', border: `1px solid ${darkMode ? '#334155' : '#bae0f0'}`, borderRadius: 16, padding: '5px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, flexShrink: 0 }}>{q.label}</button>
            ))}
          </div>
        )}

        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', background: inputAreaBg, borderTop: `1px solid ${inputBorder}`, transition: 'background .3s' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask me about clubs, events, registration..."
              style={{ flex: 1, minWidth: 0, padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${inputBorder}`, fontSize: 14, background: darkMode ? '#0f172a' : '#f8fafc', color: textPrimary, outline: 'none', resize: 'none', fontFamily: 'inherit', transition: 'border .15s, background .3s' }}
              onFocus={e => e.target.style.borderColor = '#0A6B8E'}
              onBlur={e => e.target.style.borderColor = inputBorder}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
              background: input.trim() && !loading ? '#0A6B8E' : (darkMode ? '#334155' : '#e2e8f0'),
              color: input.trim() && !loading ? '#fff' : (darkMode ? '#64748b' : '#94a3b8'),
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '.15s'
            }}>▶</button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: textSecondary, textAlign: 'center' }}>Hub Assistant may make mistakes. Verify important info with your club coordinator.</p>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}