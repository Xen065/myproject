/**
 * ============================================
 * Admin Courses Page
 * ============================================
 * List and manage all courses
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminCourseAPI } from '../../services/adminApi';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminCourses.css';

const AdminCourses = () => {
  const { hasPermission } = useAdmin();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, categoryFilter, publishedFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (publishedFilter !== 'all') {
        params.published = publishedFilter === 'published';
      }

      const response = await adminCourseAPI.getAll(params);
      setCourses(response.data.data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminCourseAPI.delete(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      alert('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await adminCourseAPI.togglePublish(courseId);
      setCourses(courses.map(course =>
        course.id === courseId
          ? { ...course, isPublished: !currentStatus }
          : course
      ));
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert(err.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleDuplicate = async (courseId, courseTitle) => {
    if (!window.confirm(`Duplicate course "${courseTitle}"?`)) {
      return;
    }

    try {
      const response = await adminCourseAPI.duplicate(courseId);
      alert('Course duplicated successfully');
      fetchCourses(); // Refresh the list
    } catch (err) {
      console.error('Error duplicating course:', err);
      alert(err.response?.data?.message || 'Failed to duplicate course');
    }
  };

  // Get unique categories from courses
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  if (loading && courses.length === 0) {
    return (
      <div className="admin-courses">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="page-header">
        <div>
          <h1>Manage Courses</h1>
          <p>Create, edit, and manage all courses</p>
        </div>
        {hasPermission('courses.create') && (
          <Link to="/admin/courses/new" className="btn btn-primary">
            <span className="btn-icon">➕</span>
            Create Course
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Courses</option>
          <option value="published">Published Only</option>
          <option value="unpublished">Unpublished Only</option>
        </select>

        <button onClick={fetchCourses} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Courses Table */}
      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Cards</th>
              <th>Enrollments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No courses found. {hasPermission('courses.create') && 'Create your first course!'}
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-info">
                      <span className="course-icon" style={{ color: course.color }}>
                        {course.icon || '📚'}
                      </span>
                      <div>
                        <div className="course-title">{course.title}</div>
                        {course.isFeatured && (
                          <span className="badge badge-featured">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{course.category || 'General'}</td>
                  <td>
                    {course.difficulty ? (
                      <span className={`badge badge-${course.difficulty}`}>
                        {course.difficulty}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{course.totalCards || 0}</td>
                  <td>{course.enrollmentCount || 0}</td>
                  <td>
                    <span className={`status-badge ${course.isPublished ? 'published' : 'unpublished'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                        className="btn-icon-action"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      {hasPermission('courses.publish') && (
                        <button
                          onClick={() => handleTogglePublish(course.id, course.isPublished)}
                          className="btn-icon-action"
                          title={course.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {course.isPublished ? '👁️' : '🚀'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicate(course.id, course.title)}
                        className="btn-icon-action"
                        title="Duplicate"
                      >
                        📋
                      </button>

                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="btn-icon-action"
                        title="View"
                      >
                        👁️
                      </button>

                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        className="btn-icon-action btn-danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {courses.length > 0 && (
        <div className="table-footer">
          <p>Total: {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
