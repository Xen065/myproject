import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressDashboard.css';

const ProgressDashboard = ({ onClose }) => {
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [dailyTime, setDailyTime] = useState([]);
  const [streak, setStreak] = useState(null);
  const [timeByCoursePeriod, setTimeByCoursePeriod] = useState('month');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, heatmapRes, courseRes, dailyRes, streakRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/summary', { headers }),
        axios.get('http://localhost:5000/api/analytics/heatmap', { headers }),
        axios.get('http://localhost:5000/api/analytics/courses/performance', { headers }),
        axios.get('http://localhost:5000/api/analytics/time/daily?days=30', { headers }),
        axios.get('http://localhost:5000/api/analytics/streak', { headers })
      ]);

      setSummary(summaryRes.data);
      setHeatmap(heatmapRes.data);
      setCoursePerformance(courseRes.data);
      setDailyTime(dailyRes.data);
      setStreak(streakRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getHeatmapColor = (minutes) => {
    if (minutes === 0) return '#ebedf0';
    if (minutes < 15) return '#c6e48b';
    if (minutes < 30) return '#7bc96f';
    if (minutes < 60) return '#239a3b';
    return '#196127';
  };

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal">
        <div className="dashboard-header">
          <h2>📊 Progress Dashboard & Analytics</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dashboard-content">
          {/* Summary Stats */}
          {summary && (
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">🎖️</div>
                <div className="stat-info">
                  <div className="stat-value">Level {summary.user.level}</div>
                  <div className="stat-label">{summary.user.experiencePoints} XP</div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.user.currentStreak} Days</div>
                  <div className="stat-label">Current Streak</div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.study.totalHours}h</div>
                  <div className="stat-label">Study Time</div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">{summary.cards.masteryRate}%</div>
                  <div className="stat-label">Mastery Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Streak Info */}
          {streak && (
            <div className="streak-section">
              <h3>🔥 Study Streak</h3>
              <div className="streak-info">
                <div className="streak-stat">
                  <span className="streak-value">{streak.currentStreak}</span>
                  <span className="streak-label">Current Streak</span>
                </div>
                <div className="streak-stat">
                  <span className="streak-value">{streak.longestStreak}</span>
                  <span className="streak-label">Longest Streak</span>
                </div>
              </div>
              <div className="milestones">
                {streak.milestones.map((milestone, idx) => (
                  <div key={idx} className={`milestone ${milestone.achieved ? 'achieved' : ''}`}>
                    <span className="milestone-icon">{milestone.icon}</span>
                    <span className="milestone-name">{milestone.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Heatmap */}
          <div className="heatmap-section">
            <h3>📅 Study Heatmap (Last 365 Days)</h3>
            <div className="heatmap-grid">
              {heatmap.slice(0, 52).map((day, idx) => (
                <div
                  key={idx}
                  className="heatmap-cell"
                  style={{ backgroundColor: getHeatmapColor(day.minutes) }}
                  title={`${day.date}: ${day.minutes} minutes`}
                ></div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-item" style={{ backgroundColor: '#ebedf0' }}></div>
              <div className="legend-item" style={{ backgroundColor: '#c6e48b' }}></div>
              <div className="legend-item" style={{ backgroundColor: '#7bc96f' }}></div>
              <div className="legend-item" style={{ backgroundColor: '#239a3b' }}></div>
              <div className="legend-item" style={{ backgroundColor: '#196127' }}></div>
              <span>More</span>
            </div>
          </div>

          {/* Daily Time Chart */}
          <div className="chart-section">
            <h3>⏰ Daily Study Time (Last 30 Days)</h3>
            <div className="bar-chart">
              {dailyTime.map((day, idx) => (
                <div key={idx} className="bar-container">
                  <div
                    className="bar"
                    style={{ height: `${Math.min(day.minutes / 2, 100)}%` }}
                    title={`${day.date}: ${day.minutes} min`}
                  ></div>
                  <div className="bar-label">{new Date(day.date).getDate()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Performance */}
          <div className="courses-section">
            <h3>📚 Course Performance</h3>
            <div className="course-list">
              {coursePerformance.map((course, idx) => (
                <div key={idx} className="course-card">
                  <div className="course-header">
                    <div className="course-name">{course.name}</div>
                    <div className="course-code">{course.code}</div>
                  </div>
                  <div className="course-stats">
                    <div className="course-stat">
                      <span className="stat-label">Mastery</span>
                      <div className="progress-bar-small">
                        <div
                          className="progress-fill-small"
                          style={{ width: `${course.masteryRate}%` }}
                        ></div>
                      </div>
                      <span className="stat-value">{course.masteryRate}%</span>
                    </div>
                    <div className="course-stat">
                      <span className="stat-label">Cards: {course.masteredCards}/{course.totalCards}</span>
                    </div>
                    <div className="course-stat">
                      <span className="stat-label">Study Time: {course.totalMinutes} min</span>
                    </div>
                    <div className="course-stat">
                      <span className="stat-label">Accuracy: {course.averageAccuracy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
