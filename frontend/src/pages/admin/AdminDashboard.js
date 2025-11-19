/**
 * ============================================
 * Admin Dashboard Page
 * ============================================
 * Main admin dashboard with overview statistics
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardAPI } from '../../services/adminApi';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { userRole } = useAdmin();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardAPI.getOverview();
      setOverview(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="user-role">Role: <strong>{userRole}</strong></p>
      </div>

      {/* Quick Stats */}
      {overview && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{overview.overview.totalUsers}</h3>
              <p>Total Users</p>
              <span className="stat-detail">
                {overview.overview.activeUsers} active
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{overview.overview.totalCourses}</h3>
              <p>Total Courses</p>
              <span className="stat-detail">
                {overview.overview.publishedCourses} published
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎴</div>
            <div className="stat-content">
              <h3>{overview.overview.totalCards}</h3>
              <p>Flashcards</p>
              <span className="stat-detail">Template cards</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{overview.overview.totalEnrollments}</h3>
              <p>Enrollments</p>
              <span className="stat-detail">All courses</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {overview && (
        <div className="recent-activity">
          <h2>Recent Activity (24 hours)</h2>
          <div className="activity-grid">
            <div className="activity-item">
              <span className="activity-count">{overview.recentActivity.newUsers}</span>
              <span className="activity-label">New Users</span>
            </div>
            <div className="activity-item">
              <span className="activity-count">{overview.recentActivity.newCourses}</span>
              <span className="activity-label">New Courses</span>
            </div>
            <div className="activity-item">
              <span className="activity-count">{overview.recentActivity.studySessions}</span>
              <span className="activity-label">Study Sessions</span>
            </div>
            <div className="activity-item">
              <span className="activity-count">{overview.recentActivity.auditLogs}</span>
              <span className="activity-label">Admin Actions</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="admin-actions">
        <h2>Admin Actions</h2>
        <div className="action-grid">
          <Link to="/admin/courses" className="action-card">
            <div className="action-icon">📚</div>
            <h3>Manage Courses</h3>
            <p>Create, edit, and delete courses</p>
          </Link>

          <Link to="/admin/courses/new" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Create Course</h3>
            <p>Add a new course with flashcards</p>
          </Link>

          {(userRole === 'admin' || userRole === 'super_admin') && (
            <Link to="/admin/users" className="action-card">
              <div className="action-icon">👥</div>
              <h3>Manage Users</h3>
              <p>View and manage user accounts</p>
            </Link>
          )}

          {(userRole === 'admin' || userRole === 'super_admin') && (
            <Link to="/admin/audit-logs" className="action-card">
              <div className="action-icon">📋</div>
              <h3>Audit Logs</h3>
              <p>View system activity logs</p>
            </Link>
          )}

          {userRole === 'super_admin' && (
            <Link to="/admin/permissions" className="action-card">
              <div className="action-icon">🔐</div>
              <h3>Permissions</h3>
              <p>Manage role permissions</p>
            </Link>
          )}
        </div>
      </div>

      {/* Top Courses */}
      {overview && overview.topCourses && overview.topCourses.length > 0 && (
        <div className="top-courses">
          <h2>Top Courses by Enrollment</h2>
          <div className="courses-table">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Enrollments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overview.topCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    <td>{course.enrollmentCount}</td>
                    <td>
                      <Link to={`/admin/courses/${course.id}`} className="btn-link">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Breakdown */}
      {overview && overview.usersByRole && (
        <div className="user-breakdown">
          <h2>Users by Role</h2>
          <div className="role-stats">
            {Object.entries(overview.usersByRole).map(([role, count]) => (
              <div key={role} className="role-stat">
                <span className="role-name">{role}</span>
                <span className="role-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
