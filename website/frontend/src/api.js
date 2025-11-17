import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Stats
export const getUserStats = () => api.get('/user-stats');
export const updateUserStats = (stats) => api.put('/user-stats', stats);

// Courses
export const getAllCourses = () => api.get('/courses');
export const getOwnedCourses = () => api.get('/courses/owned');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const purchaseCourse = (id) => api.post(`/courses/${id}/purchase`);

// Cards
export const getCardsByCourse = (courseId) => api.get(`/courses/${courseId}/cards`);
export const getDueCards = (courseId) => api.get(`/courses/${courseId}/cards/due`);
export const getCardById = (id) => api.get(`/cards/${id}`);
export const reviewCard = (id, quality) => api.post(`/cards/${id}/review`, { quality });

// Achievements
export const getAllAchievements = () => api.get('/achievements');

// Study Sessions
export const getAllStudySessions = () => api.get('/study-sessions');
export const createStudySession = (data) => api.post('/study-sessions', data);
export const completeStudySession = (id, data) => api.put(`/study-sessions/${id}/complete`, data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard');

export default api;
