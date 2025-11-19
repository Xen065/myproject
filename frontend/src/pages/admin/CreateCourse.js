/**
 * ============================================
 * Create/Edit Course Page
 * ============================================
 * Form for creating and editing courses
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminCourseAPI } from '../../services/adminApi';
import './CreateCourse.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '📚',
    color: '#6366F1',
    category: 'General',
    difficulty: 'beginner',
    language: 'English',
    price: 0,
    isFree: true,
    isPublished: false,
    isFeatured: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Load course data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await adminCourseAPI.getById(id);
      const course = response.data.data.course;

      setFormData({
        title: course.title || '',
        description: course.description || '',
        icon: course.icon || '📚',
        color: course.color || '#6366F1',
        category: course.category || 'General',
        difficulty: course.difficulty || 'beginner',
        language: course.language || 'English',
        price: course.price || 0,
        isFree: course.isFree !== undefined ? course.isFree : true,
        isPublished: course.isPublished !== undefined ? course.isPublished : false,
        isFeatured: course.isFeatured !== undefined ? course.isFeatured : false,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      price,
      isFree: price === 0
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
      errors.color = 'Invalid color format (must be hex code like #6366F1)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const courseData = {
        ...formData,
        price: parseInt(formData.price) || 0,
      };

      if (isEditMode) {
        await adminCourseAPI.update(id, courseData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/courses');
        }, 1500);
      } else {
        const response = await adminCourseAPI.create(courseData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/courses');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-course">
        <div className="loading">Loading course data...</div>
      </div>
    );
  }

  return (
    <div className="create-course">
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
        <p>{isEditMode ? 'Update course information' : 'Add a new course to the platform'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Course saved successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="course-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="title">
              Course Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to JavaScript"
              required
              maxLength="100"
              className={validationErrors.title ? 'error' : ''}
            />
            {validationErrors.title && (
              <span className="error-text">{validationErrors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon">Icon (Emoji)</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="📚"
                maxLength="50"
              />
              <small>Choose an emoji to represent this course</small>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="color-picker"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="#6366F1"
                  className={`color-text ${validationErrors.color ? 'error' : ''}`}
                  maxLength="7"
                />
              </div>
              {validationErrors.color && (
                <span className="error-text">{validationErrors.color}</span>
              )}
            </div>
          </div>
        </div>

        {/* Course Metadata */}
        <div className="form-section">
          <h2>Course Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Programming, Languages, Science"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="English"
                maxLength="20"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h2>Pricing</h2>

          <div className="form-group">
            <label htmlFor="price">Price (in coins)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
              min="0"
              step="1"
              className={validationErrors.price ? 'error' : ''}
            />
            <small>Set to 0 for free courses</small>
            {validationErrors.price && (
              <span className="error-text">{validationErrors.price}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
              />
              <span>This course is free</span>
            </label>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="form-section">
          <h2>Publishing Options</h2>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
              />
              <span>Publish this course immediately</span>
            </label>
            <small>Unpublished courses are only visible to admins</small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <span>Feature this course on the homepage</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="form-section preview-section">
          <h2>Preview</h2>
          <div className="course-preview">
            <span className="preview-icon" style={{ color: formData.color }}>
              {formData.icon || '📚'}
            </span>
            <div className="preview-content">
              <h3>{formData.title || 'Course Title'}</h3>
              <p>{formData.description || 'Course description will appear here...'}</p>
              <div className="preview-meta">
                <span className="preview-badge">{formData.category}</span>
                <span className="preview-badge">{formData.difficulty}</span>
                <span className="preview-badge">
                  {formData.isFree ? 'Free' : `${formData.price} coins`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
