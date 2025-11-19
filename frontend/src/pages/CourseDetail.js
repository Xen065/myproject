import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getById(id);
      if (response.data.success) {
        setCourse(response.data.data.course);
      }
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      const response = await courseAPI.enroll(id);
      if (response.data.success) {
        setSuccess('Successfully enrolled! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading course...</div>;
  }

  if (!course) {
    return <div className="error-container">Course not found</div>;
  }

  return (
    <div className="course-detail-container">
      <div className="course-hero">
        <div className="course-hero-content">
          {course.isFeatured && <div className="featured-badge-large">Featured Course</div>}
          <div className="course-category-large">{course.category}</div>
          <h1>{course.title}</h1>
          <p className="course-lead">{course.description}</p>

          <div className="course-stats">
            {course.difficulty && (
              <div className="stat-item">
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{course.difficulty}</span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-label">Students</span>
              <span className="stat-value">{course.enrollmentCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="course-section">
          <h2>What You'll Learn</h2>
          <p>
            This course will help you master {course.title.toLowerCase()} through
            interactive flashcards and spaced repetition learning.
          </p>
        </div>

        <div className="course-section">
          <h2>Course Details</h2>
          <ul className="course-details-list">
            <li>Category: {course.category}</li>
            {course.difficulty && <li>Difficulty Level: {course.difficulty}</li>}
            <li>Currently Enrolled: {course.enrollmentCount} students</li>
          </ul>
        </div>

        <div className="enroll-section">
          <button
            onClick={handleEnroll}
            className="btn-enroll"
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Enroll in This Course'}
          </button>
          <p className="enroll-note">
            {isAuthenticated
              ? 'Click to start learning this course'
              : 'You need to log in to enroll in this course'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
