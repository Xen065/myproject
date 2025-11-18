/**
 * ============================================
 * API Service
 * ============================================
 * Handles all communication with the backend API
 */

import axios from 'axios';

// Base URL for API (from environment variable)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (username, email, password, fullName) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      fullName
    });
    return response.data;
  },

  // Get current user
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// ============================================
// Courses API
// ============================================

export const coursesAPI = {
  // Get all courses
  getAll: async () => {
    const response = await api.get('/api/courses');
    return response.data;
  },

  // Get single course
  getOne: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },

  // Enroll in course
  enroll: async (id) => {
    const response = await api.post(`/api/courses/${id}/enroll`);
    return response.data;
  },

  // Get enrolled courses
  getEnrolled: async () => {
    const response = await api.get('/api/courses/my/enrolled');
    return response.data;
  }
};

// ============================================
// Cards API
// ============================================

export const cardsAPI = {
  // Get all cards
  getAll: async (courseId) => {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/api/cards', { params });
    return response.data;
  },

  // Get due cards
  getDue: async (courseId, limit = 20) => {
    const params = { limit };
    if (courseId) params.courseId = courseId;
    const response = await api.get('/api/cards/due', { params });
    return response.data;
  },

  // Create card
  create: async (cardData) => {
    const response = await api.post('/api/cards', cardData);
    return response.data;
  },

  // Update card
  update: async (id, cardData) => {
    const response = await api.put(`/api/cards/${id}`, cardData);
    return response.data;
  },

  // Delete card
  delete: async (id) => {
    const response = await api.delete(`/api/cards/${id}`);
    return response.data;
  }
};

// ============================================
// Study API
// ============================================

export const studyAPI = {
  // Review a card
  review: async (cardId, quality, responseTime) => {
    const response = await api.post('/api/study/review', {
      cardId,
      quality,
      responseTime
    });
    return response.data;
  },

  // Get study sessions
  getSessions: async () => {
    const response = await api.get('/api/study/sessions');
    return response.data;
  },

  // Create study session
  createSession: async (sessionData) => {
    const response = await api.post('/api/study/sessions', sessionData);
    return response.data;
  }
};

// ============================================
// Stats API
// ============================================

export const statsAPI = {
  // Get dashboard stats
  getDashboard: async () => {
    const response = await api.get('/api/stats/dashboard');
    return response.data;
  },

  // Get study history
  getHistory: async (days = 30) => {
    const response = await api.get('/api/stats/history', { params: { days } });
    return response.data;
  }
};

// ============================================
// Achievements API
// ============================================

export const achievementsAPI = {
  // Get all achievements
  getAll: async () => {
    const response = await api.get('/api/achievements');
    return response.data;
  },

  // Get unlocked achievements
  getUnlocked: async () => {
    const response = await api.get('/api/achievements/unlocked');
    return response.data;
  }
};

export default api;
