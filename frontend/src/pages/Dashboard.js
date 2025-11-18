/**
 * ============================================
 * Dashboard Page
 * ============================================
 * Main student dashboard with stats and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { statsAPI, coursesAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load stats and courses
      const [statsResponse, coursesResponse] = await Promise.all([
        statsAPI.getDashboard(),
        coursesAPI.getEnrolled()
      ]);

      setStats(statsResponse.data);
      setCourses(coursesResponse.data.enrollments || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome Back! 👋</h1>
          <p>Keep up the great work on your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.user?.streak || 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          <div className="stat-card cards">
            <div className="stat-icon">🎴</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.cards?.due || 0}</div>
              <div className="stat-label">Cards Due</div>
            </div>
          </div>

          <div className="stat-card accuracy">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.performance?.accuracy || 0}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          <div className="stat-card level">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">Level {stats?.user?.level || 1}</div>
              <div className="stat-label">{stats?.user?.xp || 0} XP</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/study" className="action-card primary">
            <div className="action-icon">📚</div>
            <div className="action-content">
              <h3>Study Now</h3>
              <p>{stats?.cards?.due || 0} cards waiting</p>
            </div>
          </Link>

          <Link to="/courses" className="action-card">
            <div className="action-icon">📖</div>
            <div className="action-content">
              <h3>Browse Courses</h3>
              <p>Discover new topics</p>
            </div>
          </Link>

          <Link to="/profile" className="action-card">
            <div className="action-icon">🏆</div>
            <div className="action-content">
              <h3>Achievements</h3>
              <p>View your progress</p>
            </div>
          </Link>
        </div>

        {/* Enrolled Courses */}
        <div className="dashboard-section">
          <h2>My Courses</h2>
          {courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map((enrollment) => (
                <div key={enrollment.id} className="course-card">
                  <div className="course-icon">{enrollment.Course?.icon || '📚'}</div>
                  <div className="course-info">
                    <h3>{enrollment.Course?.title}</h3>
                    <p>{enrollment.Course?.description}</p>
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${enrollment.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(enrollment.progressPercentage || 0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No courses yet. <Link to="/courses">Browse courses</Link> to get started!</p>
            </div>
          )}
        </div>

        {/* Recent Stats */}
        <div className="dashboard-section">
          <h2>Today's Progress</h2>
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Cards Studied:</span>
              <span className="summary-value">{stats?.cards?.completedToday || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Cards Mastered:</span>
              <span className="summary-value">{stats?.cards?.mastered || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Reviews:</span>
              <span className="summary-value">{stats?.performance?.totalReviews || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
