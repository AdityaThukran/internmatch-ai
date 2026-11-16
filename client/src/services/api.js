import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://internmatch-ai-ourb.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Profile
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const uploadResume = (formData) =>
  API.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Internships
export const getInternships = (params) => API.get('/internships', { params });
export const getInternship = (id) => API.get(`/internships/${id}`);
export const createInternship = (data) => API.post('/internships', data);
export const updateInternship = (id, data) => API.put(`/internships/${id}`, data);
export const deleteInternship = (id) => API.delete(`/internships/${id}`);

// Recommendations
export const getRecommendations = () => API.get('/recommendations');
export const generateRecommendations = () => API.post('/recommendations/generate');

// Applications
export const getApplications = () => API.get('/applications');
export const createApplication = (data) => API.post('/applications', data);
export const updateApplication = (id, data) => API.put(`/applications/${id}`, data);
export const deleteApplication = (id) => API.delete(`/applications/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const clearAllNotifications = () => API.delete('/notifications');

// Real-Time Web & Gemini Search
export const getGeminiStatus = () => API.get('/settings/gemini-status');
export const saveGeminiKey = (apiKey) => API.post('/settings/gemini-key', { apiKey });
export const fetchLiveInternships = (data) => API.post('/internships/fetch-live', data);

// Autonomous AI Career Agent Simulation
export const runAutonomousAgent = (data) => API.post('/agent/simulate-lifecycle', data);
export const getAutonomousAgentStatus = () => API.get('/agent/status');

// Email Career Sync & Tracking
export const connectEmailMailbox = (data) => API.post('/email/connect', data);
export const getEmailMailboxStatus = () => API.get('/email/status');
export const disconnectEmailMailbox = () => API.post('/email/disconnect');
export const scanEmailInbox = (data) => API.post('/email/scan', data);
export const getParsedEmails = () => API.get('/email/parsed');
export const getEmailScheduleStatus = () => API.get('/email/schedule');
export const triggerImmediateEmailSync = () => API.post('/email/sync-now');

export default API;
