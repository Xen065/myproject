/**
 * ============================================
 * Admin API Service
 * ============================================
 * API calls for admin functionality
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use(
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
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Insufficient permissions:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// ============================================
// Course Management
// ============================================
export const adminCourseAPI = {
  // Get all courses (including unpublished)
  getAll: (params) => adminApi.get('/courses', { params }),

  // Get course by ID
  getById: (id) => adminApi.get(`/courses/${id}`),

  // Create new course
  create: (courseData) => adminApi.post('/courses', courseData),

  // Update course
  update: (id, courseData) => adminApi.put(`/courses/${id}`, courseData),

  // Delete course
  delete: (id) => adminApi.delete(`/courses/${id}`),

  // Publish/unpublish course
  togglePublish: (id) => adminApi.put(`/courses/${id}/publish`),

  // Duplicate course
  duplicate: (id) => adminApi.post(`/courses/${id}/duplicate`),

  // Get course statistics
  getStats: (id) => adminApi.get(`/courses/${id}/stats`),
};

// ============================================
// Card Management
// ============================================
export const adminCardAPI = {
  // Get all card templates
  getAll: (params) => adminApi.get('/cards', { params }),

  // Get cards for specific course
  getByCourse: (courseId) => adminApi.get(`/cards/course/${courseId}`),

  // Get card by ID
  getById: (id) => adminApi.get(`/cards/${id}`),

  // Create new card
  create: (cardData) => adminApi.post('/cards', cardData),

  // Bulk create cards
  bulkCreate: (courseId, cards) => adminApi.post('/cards/bulk', { courseId, cards }),

  // Update card
  update: (id, cardData) => adminApi.put(`/cards/${id}`, cardData),

  // Delete card
  delete: (id) => adminApi.delete(`/cards/${id}`),

  // Bulk delete cards
  bulkDelete: (cardIds) => adminApi.delete('/cards/bulk/delete', { data: { cardIds } }),

  // Upload image for image occlusion
  uploadImage: (formData) => adminApi.post('/cards/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// ============================================
// User Management
// ============================================
export const adminUserAPI = {
  // Get all users
  getAll: (params) => adminApi.get('/users', { params }),

  // Get user by ID
  getById: (id) => adminApi.get(`/users/${id}`),

  // Update user
  update: (id, userData) => adminApi.put(`/users/${id}`, userData),

  // Change user role
  changeRole: (id, role) => adminApi.put(`/users/${id}/role`, { role }),

  // Activate/deactivate user
  changeStatus: (id, isActive) => adminApi.put(`/users/${id}/status`, { isActive }),

  // Delete user (super admin only)
  delete: (id) => adminApi.delete(`/users/${id}`),

  // Get user activity logs
  getActivity: (id, params) => adminApi.get(`/users/${id}/activity`, { params }),

  // Get user statistics overview
  getStatsOverview: () => adminApi.get('/users/stats/overview'),
};

// ============================================
// Audit Logs
// ============================================
export const adminAuditLogAPI = {
  // Get all audit logs
  getAll: (params) => adminApi.get('/audit-logs', { params }),

  // Get audit log by ID
  getById: (id) => adminApi.get(`/audit-logs/${id}`),

  // Get audit log statistics
  getStats: (params) => adminApi.get('/audit-logs/stats/summary', { params }),

  // Export audit logs
  exportJSON: (params) => adminApi.get('/audit-logs/export/json', { params }),

  // Get list of actions (for filters)
  getActions: () => adminApi.get('/audit-logs/actions/list'),

  // Get list of resources (for filters)
  getResources: () => adminApi.get('/audit-logs/resources/list'),
};

// ============================================
// Dashboard & Statistics
// ============================================
export const adminDashboardAPI = {
  // Get dashboard overview
  getOverview: () => adminApi.get('/dashboard/overview'),

  // Get user statistics
  getUserStats: (params) => adminApi.get('/dashboard/stats/users', { params }),

  // Get course statistics
  getCourseStats: () => adminApi.get('/dashboard/stats/courses'),

  // Get engagement statistics
  getEngagementStats: (params) => adminApi.get('/dashboard/stats/engagement', { params }),
};

// ============================================
// Course Module Management
// ============================================
export const adminCourseModuleAPI = {
  // Get all modules for a course
  getByCourse: (courseId) => adminApi.get(`/course-modules/course/${courseId}`),

  // Create new module
  create: (moduleData) => adminApi.post('/course-modules', moduleData),

  // Update module
  update: (id, moduleData) => adminApi.put(`/course-modules/${id}`, moduleData),

  // Delete module
  delete: (id) => adminApi.delete(`/course-modules/${id}`),

  // Reorder modules
  reorder: (moduleOrders) => adminApi.put('/course-modules/reorder', { moduleOrders }),
};

// ============================================
// Course Content Management
// ============================================
export const adminCourseContentAPI = {
  // Get all content for a course
  getByCourse: (courseId, moduleId = null) =>
    adminApi.get(`/course-content/course/${courseId}`, { params: { moduleId } }),

  // Create new content (with file upload)
  create: (contentData) => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(contentData).forEach(key => {
      if (contentData[key] !== null && contentData[key] !== undefined) {
        if (key === 'file' || key === 'thumbnail') {
          // File upload
          formData.append(key, contentData[key]);
        } else {
          formData.append(key, contentData[key]);
        }
      }
    });

    return adminApi.post('/course-content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update content
  update: (id, contentData) => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(contentData).forEach(key => {
      if (contentData[key] !== null && contentData[key] !== undefined) {
        if (key === 'file' || key === 'thumbnail') {
          // File upload
          formData.append(key, contentData[key]);
        } else {
          formData.append(key, contentData[key]);
        }
      }
    });

    return adminApi.put(`/course-content/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete content
  delete: (id) => adminApi.delete(`/course-content/${id}`),

  // Reorder content
  reorder: (contentOrders) => adminApi.put('/course-content/reorder', { contentOrders }),
};

// ============================================
// Permission Management
// ============================================
export const adminPermissionAPI = {
  // Get all permissions
  getAll: () => adminApi.get('/permissions'),

  // Get all role permissions (organized by role)
  getRoles: () => adminApi.get('/permissions/roles'),

  // Get permissions for a specific role
  getByRole: (role) => adminApi.get(`/permissions/roles/${role}`),

  // Grant a permission to a role
  grant: (role, permission) => adminApi.post('/permissions/grant', { role, permission }),

  // Revoke a permission from a role
  revoke: (role, permission) => adminApi.post('/permissions/revoke', { role, permission }),

  // Bulk grant permissions
  bulkGrant: (role, permissions) => adminApi.post('/permissions/bulk-grant', { role, permissions }),

  // Get permission matrix (all roles × all permissions)
  getMatrix: () => adminApi.get('/permissions/matrix'),
};

// ============================================
// Health Check
// ============================================
export const adminHealthAPI = {
  check: () => adminApi.get('/health'),
};

export default adminApi;
