import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ClubDirectory from './pages/ClubDirectory';
import ClubProfile from './pages/ClubProfile';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './pages/Chatbot';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const getRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).role; }
  catch { return null; }
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

function ChatBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token || location.pathname === '/chatbot') return null;
  return (
    <button onClick={() => navigate('/chatbot')} title="Hub Assistant" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      width: 56, height: 56, borderRadius: '50%',
      background: 'linear-gradient(135deg, #084D68, #0A6B8E)',
      border: '2px solid rgba(255,255,255,.3)',
      boxShadow: '0 4px 20px rgba(10,107,142,.4)',
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 24,
      transition: 'transform .2s, box-shadow .2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(10,107,142,.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,107,142,.4)'; }}
    >🤖</button>
  );
}

function AppContent() {
  const { darkMode } = useTheme();
  useEffect(() => {
    document.body.style.background = darkMode ? '#0f172a' : '';
    document.body.style.color = darkMode ? '#e2e8f0' : '';
  }, [darkMode]);

  return (
    <Router>
      <Navbar />
      <ChatBubble />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clubs" element={<ClubDirectory />} />
        <Route path="/clubs/:id" element={<ClubProfile />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="systemAdmin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;