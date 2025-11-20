import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SmartStudyPlanner.css';

const SmartStudyPlanner = ({ onClose }) => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [todayPriorities, setTodayPriorities] = useState(null);
  const [optimalTimes, setOptimalTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('week'); // 'week', 'today', 'optimal'

  useEffect(() => {
    loadTodayPriorities();
  }, []);

  const loadTodayPriorities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/planner/today-priorities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayPriorities(response.data);
    } catch (error) {
      console.error('Error loading today priorities:', error);
    }
  };

  const generateWeeklyPlan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/planner/plan-week', {
        availableHoursPerDay: 4
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyPlan(response.data);
      setActiveTab('week');
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      alert('Failed to generate weekly plan');
    } finally {
      setLoading(false);
    }
  };

  const loadOptimalTimes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/planner/optimal-times', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOptimalTimes(response.data);
      setActiveTab('optimal');
    } catch (error) {
      console.error('Error loading optimal times:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return '#f44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="planner-modal-overlay">
      <div className="planner-modal">
        <div className="planner-header">
          <h2>🧠 Smart Study Planner</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="planner-content">
          <div className="planner-tabs">
            <button
              className={`tab ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Today's Priorities
            </button>
            <button
              className={`tab ${activeTab === 'week' ? 'active' : ''}`}
              onClick={() => {
                if (!weeklyPlan) generateWeeklyPlan();
                else setActiveTab('week');
              }}
            >
              Weekly Plan
            </button>
            <button
              className={`tab ${activeTab === 'optimal' ? 'active' : ''}`}
              onClick={() => {
                if (!optimalTimes) loadOptimalTimes();
                else setActiveTab('optimal');
              }}
            >
              Best Study Times
            </button>
          </div>

          {/* Today's Priorities */}
          {activeTab === 'today' && todayPriorities && (
            <div className="today-section">
              <div className="priority-header">
                <h3>📋 Today's Top Priorities</h3>
                <div className="summary-info">
                  <span>Estimated Time: {todayPriorities.summary.estimatedTotalTime} min</span>
                </div>
              </div>

              <div className="priority-list">
                {todayPriorities.priorities.map((priority, idx) => (
                  <div
                    key={idx}
                    className="priority-card"
                    style={{ borderLeftColor: getUrgencyColor(priority.urgency) }}
                  >
                    <div className="priority-header-row">
                      <span className="priority-type">{priority.type === 'exam' ? '📝' : priority.type === 'task' ? '✅' : '🃏'}</span>
                      <h4>{priority.title}</h4>
                      <span className={`urgency-badge ${priority.urgency}`}>
                        {priority.urgency}
                      </span>
                    </div>
                    <p className="priority-description">{priority.description}</p>
                    {priority.courseName && (
                      <p className="priority-course">📚 {priority.courseName}</p>
                    )}
                    <div className="priority-footer">
                      <span className="estimate-time">⏱️ {priority.estimatedTime} min</span>
                      <span className={`priority-level ${priority.priority}`}>
                        {priority.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {activeTab === 'week' && (
            <div className="week-section">
              {!weeklyPlan ? (
                <div className="generate-plan">
                  <p>Generate a personalized weekly study plan based on your tasks, exams, and performance data.</p>
                  <button className="generate-btn" onClick={generateWeeklyPlan} disabled={loading}>
                    {loading ? 'Generating...' : '🤖 Generate Weekly Plan'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="plan-summary">
                    <h3>📅 Your Personalized Weekly Plan</h3>
                    <div className="summary-stats">
                      <span>🎯 {weeklyPlan.summary.totalTasks} Tasks</span>
                      <span>📝 {weeklyPlan.summary.totalExams} Exams</span>
                      <span>🃏 {weeklyPlan.summary.totalDueCards} Cards Due</span>
                      <span>⏱️ {weeklyPlan.summary.estimatedWeeklyHours}h Total</span>
                    </div>
                  </div>

                  <div className="daily-plans">
                    {weeklyPlan.weeklyPlan.map((day, idx) => (
                      <div key={idx} className="day-card">
                        <div className="day-header">
                          <h4>{day.dayOfWeek}</h4>
                          <span className="day-date">{day.date}</span>
                          <span className="day-total">{day.totalMinutes} min</span>
                        </div>
                        <div className="activities-list">
                          {day.activities.length > 0 ? (
                            day.activities.map((activity, actIdx) => (
                              <div key={actIdx} className={`activity-item ${activity.type}`}>
                                <span className="activity-icon">
                                  {activity.type === 'exam_prep' ? '📝' :
                                   activity.type === 'task' ? '✅' :
                                   activity.type === 'card_review' ? '🃏' :
                                   activity.type === 'break' ? '☕' : '📚'}
                                </span>
                                <div className="activity-info">
                                  <span className="activity-title">{activity.title}</span>
                                  {activity.courseName && (
                                    <span className="activity-course">{activity.courseName}</span>
                                  )}
                                </div>
                                <span className="activity-duration">{Math.round(activity.duration)} min</span>
                              </div>
                            ))
                          ) : (
                            <p className="no-activities">No activities planned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Optimal Times */}
          {activeTab === 'optimal' && optimalTimes && (
            <div className="optimal-section">
              <h3>⏰ Your Best Study Times</h3>
              <p className="optimal-desc">{optimalTimes.suggestion}</p>

              <div className="optimal-times-list">
                {optimalTimes.bestTimes.length > 0 ? (
                  optimalTimes.bestTimes.map((time, idx) => (
                    <div key={idx} className="optimal-time-card">
                      <div className="time-rank">#{idx + 1}</div>
                      <div className="time-info">
                        <h4>{time.timeRange}</h4>
                        <p>{time.averageAccuracy}% avg accuracy</p>
                        <p>{time.sessionCount} sessions completed</p>
                      </div>
                      <div className="time-performance">
                        <div className="performance-bar">
                          <div
                            className="performance-fill"
                            style={{ width: `${time.averageAccuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Complete more study sessions to see your optimal times</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartStudyPlanner;
