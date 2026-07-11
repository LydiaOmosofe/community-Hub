import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatHistory } from '../services/api';
import { useWindowSize } from '../hooks/useWindowSize';
import { PanelLeftOpen } from 'lucide-react';

const renderMarkdown = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
    line = line.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#0A6B8E;word-break:break-all;">$1</a>'
    );
    return `<span>${line}</span>`;
  }).join('<br/>');
};

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');
const getInitials = (name) => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const SUGGESTIONS = [
  {  title: 'Recommend a club', sub: 'Find the right club for you', q: 'Recommend a club for me' },
  {  title: 'Upcoming events', sub: "See what's on this week", q: 'What events are happening this week?' },
  {  title: 'How do I register?', sub: 'Step-by-step guide', q: 'How do I register for a club?' },
  {  title: 'Sports clubs', sub: 'Football, badminton & more', q: 'What sports clubs are available?' },
  {  title: 'Volunteer', sub: 'Give back to the community', q: 'What volunteer opportunities are there?' },
  {  title: 'Tech clubs', sub: 'Coding, AI & robotics', q: 'Which tech club should I join?' },
];

const QUICK = [
  { icon: '📅', label: 'Events', q: 'What events are happening this week?' },
  { icon: '🏛️', label: 'Clubs', q: 'Show me all clubs' },
  { icon: '📢', label: 'Notifications', q: 'Any new announcements?' },
  { icon: '📋', label: 'Registration', q: 'How do I register for a club?' },
  { icon: '❤️', label: 'Volunteer', q: 'What volunteer opportunities are there?' },
];

export default function Chatbot() {
  const { isMobile } = useWindowSize();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const key = `chatHistory_${user.userID || 'guest'}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    }
    catch { return []; }
  });

  const [activeSession, setActiveSession] = useState(null);
  const msgsRef = useRef();

  useEffect(() => {
    getChatHistory().then(r => {
      const hist = Array.isArray(r.data) ? r.data : (r.data?.history || r.data?.logs || []);
      if (hist.length > 0) {
        const msgs = [];
        hist.slice(-20).forEach(h => {
          if (h.message) msgs.push({ role: 'user', text: h.message, time: h.createdAt });
          if (h.response) msgs.push({ role: 'ai', text: h.response, time: h.createdAt });
        });
        if (msgs.length > 0) { setMessages(msgs); setStarted(true); }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const saveSession = (msgs) => {
    if (msgs.length < 2) return;
    const firstUserMsg = msgs.find(m => m.role === 'user');
    if (!firstUserMsg) return;
    const session = {
      id: Date.now(),
      title: firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? '…' : ''),
      date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }),
      messages: msgs
    };
    setChatHistory(prev => {
      const updated = [session, ...prev.filter(s => s.id !== activeSession)].slice(0, 20);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const key = `chatHistory_${user.userID || 'guest'}`;
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
    setActiveSession(session.id);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setStarted(true);
    const newMessages = [...messages, { role: 'user', text: msg, time: fmt() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const r = await sendChatMessage({ message: msg });
      const reply = r.data?.response || r.data?.reply || r.data?.message || 'Sorry, I could not get a response.';
      const finalMessages = [...newMessages, { role: 'ai', text: reply, time: fmt() }];
      setMessages(finalMessages);
      saveSession(finalMessages);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please check your connection and try again.', time: fmt() }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => { setMessages([]); setStarted(false); setInput(''); setActiveSession(null); setSidebarOpen(false); };

  const loadSession = (session) => {
    setMessages(session.messages);
    setStarted(true);
    setActiveSession(session.id);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div style={{ padding: 16 }}>
        <button onClick={newChat} style={{ width: '100%', background: '#0A6B8E', color: '#fff', border: 'none', borderRadius: 9, padding: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          + New chat
        </button>
      </div>

      <div style={{ padding: '0 14px', marginTop: 18 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8, paddingLeft: 4 }}>Today</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8, background: '#EAF6FA', cursor: 'pointer', marginBottom: 2 }}>
          <span style={{ fontSize: 15, color: '#0A6B8E' }}>💬</span>
          <span style={{ fontSize: 13, color: '#0A6B8E', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Current chat</span>
        </div>
      </div>

      <div style={{ padding: '0 14px', marginTop: 16, flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8, paddingLeft: 4 }}>Recent</p>
        {chatHistory.length === 0 ? (
          <p style={{ fontSize: 12, color: '#d1d5db', paddingLeft: 4 }}>No conversations yet</p>
        ) : chatHistory.map((session) => (
          <div key={session.id} onClick={() => loadSession(session)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 10px',
            borderRadius: 8, cursor: 'pointer', marginBottom: 2, transition: '.15s',
            background: activeSession === session.id ? '#EAF6FA' : 'transparent'
          }}
            onMouseEnter={e => { if (activeSession !== session.id) e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { if (activeSession !== session.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 14, color: '#9ca3af', marginTop: 1, flexShrink: 0 }}>💬</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, color: activeSession === session.id ? '#0A6B8E' : '#374151', fontWeight: activeSession === session.id ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#9ca3af' }}>{session.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0A6B8E', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{getInitials(getUser().name)}</div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{getUser().name || 'Student'}</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>SEGi Student</p>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', height: 'calc(100vh - 66px)', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>

      {/* ── SIDEBAR: fixed column on desktop, slide-in overlay on mobile ── */}
      {!isMobile ? (
        <div style={{ width: 248, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <SidebarContent />
        </div>
      ) : (
        sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: 280, background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,.15)' }}>
              <SidebarContent />
            </div>
          </>
        )
      )}

      {/* ── CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: '#EAF6FA', border: 'none', borderRadius: 8, width: 36, height: 36, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>☰</button>
          )}
          <div style={{ width: 40, height: 40, background: '#EAF6FA', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🤖</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}> AI Assistant </p>
            <p style={{ fontSize: 11.5, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 14px' : '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!started ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 10 }}>
              <div style={{ width: 64, height: 64, background: '#EAF6FA', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>🤖</div>
              <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: '#111', marginBottom: 8 }}>Hello there! 👋</h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, maxWidth: 340, margin: '0 auto 28px' }}>
                I'm your Hub assistant. Ask me anything about clubs, events, registration, or campus life.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 10, width: '100%', maxWidth: 500 }}>
  {SUGGESTIONS.map(s => (
    <div key={s.q} onClick={() => send(s.q)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: isMobile ? '10px 12px' : '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A6B8E'; e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <p style={{ fontSize: isMobile ? 11.5 : 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>{s.icon} {s.title}</p>
      {!isMobile && <p style={{ fontSize: 11.5, color: '#9ca3af' }}>{s.sub}</p>}
    </div>
  ))}
</div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: m.role === 'user' ? '#0A6B8E' : '#EAF6FA', color: m.role === 'user' ? '#fff' : '#0A6B8E' }}>
                  {m.role === 'user' ? getInitials(getUser().name) : 'AI'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: isMobile ? '78vw' : 420, padding: '11px 16px', borderRadius: 16, fontSize: 13.5, lineHeight: 1.75,
                    background: m.role === 'user' ? '#0A6B8E' : '#fff',
                    color: m.role === 'user' ? '#fff' : '#111',
                    border: m.role === 'ai' ? '1px solid #e5e7eb' : 'none',
                    borderBottomLeftRadius: m.role === 'ai' ? 4 : 16,
                    borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                    whiteSpace: 'pre-wrap'
                  }}
                    {...(m.role === 'ai'
                      ? { dangerouslySetInnerHTML: { __html: renderMarkdown(m.text) } }
                      : { children: m.text }
                    )}
                  />
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 4, padding: '0 3px' }}>{m.time}</div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF6FA', color: '#0A6B8E', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AI</div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, borderBottomLeftRadius: 4, padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0A6B8E', opacity: .3, animation: `bounce 1.2s ${delay}s infinite` }} />
                ))}
                <style>{`@keyframes bounce{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-5px)}}`}</style>
              </div>
            </div>
          )}
        </div>

        {/* Quick action chips */}
        <div style={{ display: 'flex', gap: 7, padding: isMobile ? '10px 14px' : '10px 24px', flexWrap: 'wrap', background: '#fff', borderTop: '1px solid #f3f4f6', flexShrink: 0, overflowX: isMobile ? 'auto' : 'visible' }}>
          {QUICK.map(q => (
            <span key={q.q} onClick={() => send(q.q)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: '.15s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A6B8E'; e.currentTarget.style.color = '#0A6B8E'; e.currentTarget.style.background = '#f0f9ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#f9fafb'; }}
            >{q.icon} {q.label}</span>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: isMobile ? '10px 14px 14px' : '12px 24px 16px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1.5px solid #d1d5db', borderRadius: 11, padding: '4px 4px 4px 16px', gap: 10, transition: '.15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#0A6B8E'; e.currentTarget.style.background = '#fff'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
          >
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && send()}
              placeholder="Ask me about clubs, events, registration..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: '#111', padding: '8px 0', fontFamily: 'inherit' }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? '#9ca3af' : '#0A6B8E',
              color: '#fff', border: 'none', width: 36, height: 36, borderRadius: 8,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
            }}>➤</button>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 7 }}>Hub Assistant may make mistakes. Verify important info with your club coordinator.</p>
        </div>
      </div>
    </div>
  );
}