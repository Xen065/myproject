import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Course endpoints
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolled: () => api.get('/courses/my/enrolled'),
};

// Stats endpoints
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getHistory: (days = 30) => api.get('/stats/history', { params: { days } }),
};

// Card endpoints
export const cardAPI = {
  getAll: (params) => api.get('/cards', { params }),
  getByCategory: (category) => api.get('/cards', { params: { category } }),
  getDueCards: (params) => api.get('/cards/due', { params }),
  getAllCards: () => api.get('/cards', { params: { limit: 200 } }),
};

// Study endpoints
export const studyAPI = {
  reviewCard: (cardId, quality, responseTime) => api.post('/study/review', { cardId, quality, responseTime }),
  skipCard: (cardId) => api.post('/study/skip', { cardId }),
  createSession: (data) => api.post('/study/sessions', data),
  getSessions: (limit) => api.get('/study/sessions', { params: { limit } }),
};

// Achievement endpoints
export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
};

// User settings endpoints
export const userSettingsAPI = {
  getFrequencyMode: () => api.get('/users/settings/frequency-mode'),
  updateFrequencyMode: (frequencyMode) => api.put('/users/settings/frequency-mode', { frequencyMode }),
};

// Study Tasks (Todo List) endpoints
export const studyTaskAPI = {
  getAll: (params) => api.get('/study/tasks', { params }),
  getById: (id) => api.get(`/study/tasks/${id}`),
  create: (taskData) => api.post('/study/tasks', taskData),
  update: (id, taskData) => api.put(`/study/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/study/tasks/${id}`),
  complete: (id) => api.post(`/study/tasks/${id}/complete`),
};

// Exam Reminders endpoints
export const examReminderAPI = {
  getAll: (params) => api.get('/study/exams', { params }),
  getUpcoming: () => api.get('/study/exams/upcoming'),
  getById: (id) => api.get(`/study/exams/${id}`),
  create: (examData) => api.post('/study/exams', examData),
  update: (id, examData) => api.put(`/study/exams/${id}`, examData),
  delete: (id) => api.delete(`/study/exams/${id}`),
  markPassed: (id) => api.post(`/study/exams/${id}/mark-passed`),
};

// Calendar endpoints
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  getEventsByDay: (date) => api.get(`/calendar/events/day/${date}`),
  getSummary: () => api.get('/calendar/summary'),
};

export default api;
