import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudyGoals.css';

const StudyGoals = ({ onClose, courses }) => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'completed', 'all'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalType: 'daily_time',
    targetValue: '',
    unit: 'minutes',
    courseId: '',
    deadline: '',
    priority: 'medium',
    xpReward: 50,
    coinReward: 10,
    isRecurring: false,
    recurringPeriod: 'daily'
  });

  useEffect(() => {
    loadGoals();
    loadStats();
  }, [filterTab]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const filters = filterTab === 'all' ? {} :
                     filterTab === 'completed' ? { isCompleted: true } :
                     { isActive: true, isCompleted: false };

      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`http://localhost:5000/api/study/goals?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study/goals/stats/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const goalData = {
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        courseId: formData.courseId || null
      };

      if (editingGoal) {
        await axios.put(`http://localhost:5000/api/study/goals/${editingGoal.id}`, goalData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/study/goals', goalData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      resetForm();
      loadGoals();
      loadStats();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/study/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadGoals();
      loadStats();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const completeGoal = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/study/goals/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Goal completed! 🎉\n+${response.data.rewardsEarned.xp} XP\n+${response.data.rewardsEarned.coins} coins`);
      loadGoals();
      loadStats();
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      goalType: goal.goalType,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      courseId: goal.courseId || '',
      deadline: goal.deadline || '',
      priority: goal.priority,
      xpReward: goal.xpReward,
      coinReward: goal.coinReward,
      isRecurring: goal.isRecurring,
      recurringPeriod: goal.recurringPeriod || 'daily'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      goalType: 'daily_time',
      targetValue: '',
      unit: 'minutes',
      courseId: '',
      deadline: '',
      priority: 'medium',
      xpReward: 50,
      coinReward: 10,
      isRecurring: false,
      recurringPeriod: 'daily'
    });
    setShowForm(false);
  };

  const getProgressPercentage = (goal) => {
    return Math.min((goal.currentProgress / goal.targetValue) * 100, 100);
  };

  const goalTypeOptions = [
    { value: 'daily_time', label: 'Daily Study Time', unit: 'minutes', icon: '⏱️' },
    { value: 'weekly_time', label: 'Weekly Study Time', unit: 'minutes', icon: '📅' },
    { value: 'daily_cards', label: 'Daily Cards Reviewed', unit: 'cards', icon: '🃏' },
    { value: 'weekly_cards', label: 'Weekly Cards Reviewed', unit: 'cards', icon: '🎴' },
    { value: 'daily_tasks', label: 'Daily Tasks Completed', unit: 'tasks', icon: '✅' },
    { value: 'streak_milestone', label: 'Study Streak Goal', unit: 'days', icon: '🔥' },
    { value: 'accuracy_target', label: 'Accuracy Target', unit: 'percentage', icon: '🎯' },
    { value: 'custom', label: 'Custom Goal', unit: 'units', icon: '⭐' }
  ];

  return (
    <div className="goals-modal-overlay">
      <div className="goals-modal">
        <div className="goals-header">
          <h2>🏆 Study Goals & Milestones</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="goals-content">
          {stats && (
            <div className="goals-summary">
              <div className="summary-card">
                <span className="summary-value">{stats.activeGoals}</span>
                <span className="summary-label">Active Goals</span>
              </div>
              <div className="summary-card">
                <span className="summary-value">{stats.completedGoals}</span>
                <span className="summary-label">Completed</span>
              </div>
              <div className="summary-card">
                <span className="summary-value">{stats.completionRate}%</span>
                <span className="summary-label">Success Rate</span>
              </div>
              <div className="summary-card warning">
                <span className="summary-value">{stats.overdue}</span>
                <span className="summary-label">Overdue</span>
              </div>
            </div>
          )}

          <div className="goals-actions">
            <button className="add-goal-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Goal'}
            </button>
          </div>

          {showForm && (
            <form className="goal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Goal Type</label>
                <select value={formData.goalType} onChange={(e) => {
                  const selectedType = goalTypeOptions.find(opt => opt.value === e.target.value);
                  setFormData({ ...formData, goalType: e.target.value, unit: selectedType.unit });
                }}>
                  {goalTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Target Value ({formData.unit})</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="form-row">
                <label>Course (Optional)</label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
                  <option value="">All Courses</option>
                  {courses && courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-group">
                <div className="form-row half">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-row half">
                  <label>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                  Recurring Goal
                </label>
                {formData.isRecurring && (
                  <select value={formData.recurringPeriod} onChange={(e) => setFormData({ ...formData, recurringPeriod: e.target.value })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>

              <button type="submit" className="submit-btn">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </form>
          )}

          <div className="goals-tabs">
            <button className={`tab ${filterTab === 'active' ? 'active' : ''}`} onClick={() => setFilterTab('active')}>
              Active
            </button>
            <button className={`tab ${filterTab === 'completed' ? 'active' : ''}`} onClick={() => setFilterTab('completed')}>
              Completed
            </button>
            <button className={`tab ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>
              All
            </button>
          </div>

          <div className="goals-list">
            {goals.length > 0 ? (
              goals.map(goal => (
                <div key={goal.id} className={`goal-card ${goal.isCompleted ? 'completed' : ''} priority-${goal.priority}`}>
                  <div className="goal-header-row">
                    <h4>{goal.icon || '🎯'} {goal.title}</h4>
                    <span className={`priority-badge ${goal.priority}`}>{goal.priority}</span>
                  </div>

                  {goal.course && (
                    <p className="goal-course">📚 {goal.course.name}</p>
                  )}

                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(goal)}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {goal.currentProgress.toFixed(0)} / {goal.targetValue} {goal.unit}
                      <span className="progress-percent">({getProgressPercentage(goal).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <div className="goal-footer">
                    <div className="goal-rewards">
                      <span>🎖️ {goal.xpReward} XP</span>
                      <span>🪙 {goal.coinReward} coins</span>
                      {goal.isRecurring && <span>🔄 {goal.recurringPeriod}</span>}
                    </div>

                    <div className="goal-actions">
                      {!goal.isCompleted && (
                        <>
                          <button className="action-btn edit" onClick={() => editGoal(goal)}>✏️</button>
                          <button className="action-btn complete" onClick={() => completeGoal(goal.id)}>✅</button>
                        </>
                      )}
                      <button className="action-btn delete" onClick={() => deleteGoal(goal.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-goals">
                <p>No goals found. Create your first goal to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGoals;
