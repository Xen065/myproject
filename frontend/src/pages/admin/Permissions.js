/**
 * ============================================
 * Permission Management Page
 * ============================================
 * Super Admin page for managing role permissions
 */

import React, { useState, useEffect } from 'react';
import { adminPermissionAPI } from '../../services/adminApi';
import { useAdmin } from '../../contexts/AdminContext';
import './Permissions.css';

const Permissions = () => {
  const { userRole } = useAdmin();
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('student');
  const [filterCategory, setFilterCategory] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  const roles = [
    { value: 'student', label: 'Student', color: '#3B82F6' },
    { value: 'teacher', label: 'Teacher', color: '#10B981' },
    { value: 'admin', label: 'Admin', color: '#F59E0B' },
    { value: 'super_admin', label: 'Super Admin', color: '#EF4444' }
  ];

  useEffect(() => {
    fetchPermissionMatrix();
  }, []);

  const fetchPermissionMatrix = async () => {
    try {
      setLoading(true);
      const response = await adminPermissionAPI.getMatrix();
      setPermissions(response.data.data.permissions);
      setMatrix(response.data.data.matrix);
      setError(null);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.response?.data?.error || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (role, permissionName) => {
    try {
      const isCurrentlyGranted = matrix[role][permissionName];

      if (isCurrentlyGranted) {
        // Revoke permission
        await adminPermissionAPI.revoke(role, permissionName);
        setSuccessMessage(`Revoked "${permissionName}" from ${role}`);
      } else {
        // Grant permission
        await adminPermissionAPI.grant(role, permissionName);
        setSuccessMessage(`Granted "${permissionName}" to ${role}`);
      }

      // Refresh matrix
      await fetchPermissionMatrix();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling permission:', err);
      setError(err.response?.data?.error || 'Failed to update permission');
    }
  };

  const getPermissionsByCategory = () => {
    if (filterCategory === 'all') {
      return permissions;
    }
    return permissions.filter(p => p.category === filterCategory);
  };

  const getCategories = () => {
    const categories = ['all'];
    permissions.forEach(p => {
      if (p.category && !categories.includes(p.category)) {
        categories.push(p.category);
      }
    });
    return categories;
  };

  const getRolePermissionCount = (role) => {
    if (!matrix || !matrix[role]) return 0;
    return Object.values(matrix[role]).filter(v => v === true).length;
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="permissions-page">
        <div className="error-message">
          Only Super Admins can access permission management.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="permissions-page">
        <div className="loading">Loading permissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="permissions-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const filteredPermissions = getPermissionsByCategory();

  return (
    <div className="permissions-page">
      <div className="permissions-header">
        <h1>Permission Management</h1>
        <p>Manage role-based permissions for the platform</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Role Summary Cards */}
      <div className="role-summary">
        {roles.map(role => (
          <div
            key={role.value}
            className={`role-card ${selectedRole === role.value ? 'active' : ''}`}
            style={{ borderColor: role.color }}
            onClick={() => setSelectedRole(role.value)}
          >
            <h3 style={{ color: role.color }}>{role.label}</h3>
            <div className="permission-count">
              {getRolePermissionCount(role.value)} permissions
            </div>
          </div>
        ))}
      </div>

      {/* Filter by Category */}
      <div className="filters">
        <label>Filter by category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {getCategories().map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Permission Matrix Table */}
      <div className="permission-matrix">
        <table>
          <thead>
            <tr>
              <th className="permission-column">Permission</th>
              <th className="description-column">Description</th>
              {roles.map(role => (
                <th
                  key={role.value}
                  className={`role-column ${selectedRole === role.value ? 'active' : ''}`}
                  style={{ color: role.color }}
                >
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map(permission => (
              <tr key={permission.name}>
                <td className="permission-name">
                  <code>{permission.name}</code>
                  {permission.category && (
                    <span className="category-badge">{permission.category}</span>
                  )}
                </td>
                <td className="permission-description">
                  {permission.description}
                </td>
                {roles.map(role => (
                  <td key={role.value} className="permission-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={matrix && matrix[role.value] && matrix[role.value][permission.name]}
                        onChange={() => handleTogglePermission(role.value, permission.name)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="legend">
        <h3>Permission Categories</h3>
        <ul>
          <li><strong>courses</strong> - Course creation, editing, deletion, publishing</li>
          <li><strong>cards</strong> - Flashcard management and templates</li>
          <li><strong>users</strong> - User management, role changes, account control</li>
          <li><strong>achievements</strong> - Achievement system management</li>
          <li><strong>system</strong> - Platform settings, audit logs, statistics</li>
        </ul>
      </div>
    </div>
  );
};

export default Permissions;
