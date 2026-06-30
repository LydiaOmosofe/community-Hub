import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically attach token to every request if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// CLUBS
export const getClubs = () => API.get('/clubs');
export const getClub = (id) => API.get(`/clubs/${id}`);

// EVENTS
export const getEvents = () => API.get('/events');
export const getEventsByClub = (clubID) => API.get(`/events/club/${clubID}`);

// CHATBOT
export const sendChatMessage = (data) => API.post('/chatbot/query', data);
export const getChatHistory = () => API.get('/chatbot/history');

// NOTIFICATIONS
export const getNotifications = () => API.get('/notifications');

//forgot password and reset password
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });