/**
 * ============================================
 * Admin Context
 * ============================================
 * Provides admin-specific state and functions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminHealthAPI } from '../services/adminApi';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has admin access
  const isAdmin = user && ['teacher', 'admin', 'super_admin'].includes(user.role);
  const isSuperAdmin = user && user.role === 'super_admin';

  // Verify admin API access
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isAdmin) {
        setIsAdminVerified(false);
        setIsLoading(false);
        return;
      }

      try {
        await adminHealthAPI.check();
        setIsAdminVerified(true);
      } catch (error) {
        console.error('Admin access verification failed:', error);
        setIsAdminVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, [isAdmin, user]);

  // Check specific permission
  const hasPermission = (permission) => {
    // Super admin has all permissions
    if (isSuperAdmin) return true;

    // Add permission checking logic here
    // This is a simplified version - in production you'd check against actual permissions
    const rolePermissions = {
      teacher: [
        'courses.create',
        'courses.edit.own',
        'courses.delete.own',
        'cards.create',
        'cards.edit.own',
        'cards.delete.own',
      ],
      admin: [
        'courses.create',
        'courses.edit.any',
        'courses.delete.any',
        'cards.create',
        'cards.edit.any',
        'cards.delete.any',
        'users.view.all',
        'users.edit.any',
        'audit_logs.view.all',
        'stats.view.platform',
      ],
    };

    const userPermissions = rolePermissions[user?.role] || [];
    return userPermissions.includes(permission);
  };

  const value = {
    isAdmin,
    isSuperAdmin,
    isAdminVerified,
    isLoading,
    hasPermission,
    userRole: user?.role,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
