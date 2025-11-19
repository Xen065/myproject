import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import './Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      if (response.data.success) {
        setCourses(response.data.data.courses);
      }
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-container">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Course Catalog</h1>
        <p>Discover and enroll in courses to expand your knowledge</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              {course.isFeatured && <div className="featured-badge">Featured</div>}
              <div className="course-category">{course.category}</div>
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                {course.difficulty && <span>📊 {course.difficulty}</span>}
                <span>👥 {course.enrollmentCount} enrolled</span>
                <span>
                  💰 {course.isFree
                    ? 'Free'
                    : course.priceType === 'rupees'
                      ? `₹${course.price}`
                      : `${course.price} coins`
                  }
                </span>
              </div>
              <Link to={`/courses/${course.id}`} className="btn-course">
                View Details →
              </Link>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No courses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
