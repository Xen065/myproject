/**
 * ============================================
 * Courses Page
 * ============================================
 * Browse and enroll in courses
 */

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { coursesAPI } from '../services/api';
import './Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await coursesAPI.enroll(courseId);
      alert('Enrolled successfully!');
      loadCourses(); // Reload to update enrollment status
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to enroll';
      alert(message);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading courses...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="courses-container">
        <div className="courses-header">
          <h1>📚 Course Catalog</h1>
          <p>Explore courses and expand your knowledge</p>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card-large"
              style={{ borderColor: course.color }}
            >
              <div className="course-header" style={{ backgroundColor: course.color }}>
                <div className="course-icon-large">{course.icon}</div>
                <div className="course-badge">{course.difficulty}</div>
              </div>

              <div className="course-body">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>

                <div className="course-meta">
                  <span>📖 {course.category}</span>
                  <span>🎴 {course.totalCards} cards</span>
                  <span>👥 {course.enrollmentCount} students</span>
                </div>

                <div className="course-footer">
                  {course.isFree ? (
                    <span className="course-price free">FREE</span>
                  ) : (
                    <span className="course-price">{course.price} coins</span>
                  )}

                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="btn-enroll"
                    disabled={enrolling === course.id}
                  >
                    {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="empty-state">
            <p>No courses available yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Courses;
