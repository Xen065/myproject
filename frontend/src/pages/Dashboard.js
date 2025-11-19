import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { statsAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await statsAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName || user?.username}!</h1>
        <p>Continue your learning journey</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats?.cards?.due || 0}</h3>
            <p>Cards Due Today</p>
          </div>
          <Link to="/study" className="stat-link">Study Now →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats?.courses?.enrolled || 0}</h3>
            <p>Enrolled Courses</p>
          </div>
          <Link to="/courses" className="stat-link">Browse Courses →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats?.cards?.mastered || 0}</h3>
            <p>Cards Mastered</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats?.performance?.accuracy || 0}%</h3>
            <p>Accuracy Rate</p>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Your Progress</h2>
        <div className="progress-cards">
          <div className="progress-card">
            <h3>Level & XP</h3>
            <div className="progress-details">
              <div className="level-badge">Level {stats?.user?.level || 1}</div>
              <p>{stats?.user?.xp || 0} XP</p>
            </div>
          </div>

          <div className="progress-card">
            <h3>Current Streak</h3>
            <div className="progress-details">
              <div className="streak-display">🔥 {stats?.user?.streak || 0} days</div>
              <p>Longest: {stats?.user?.longestStreak || 0} days</p>
            </div>
          </div>

          <div className="progress-card">
            <h3>Today's Progress</h3>
            <div className="progress-details">
              <p>{stats?.cards?.completedToday || 0} cards reviewed</p>
              <p>{stats?.performance?.totalReviews || 0} total reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/study" className="action-btn primary">
            Start Studying
          </Link>
          <Link to="/courses" className="action-btn secondary">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
