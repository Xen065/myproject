import React, { useState, useEffect } from 'react';
import { examReminderAPI, courseAPI } from '../services/api';
import './ExamReminder.css';

const ExamReminder = ({ onClose }) => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // upcoming, all, passed
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const [formData, setFormData] = useState({
    examTitle: '',
    examDate: '',
    examTime: '',
    courseId: '',
    location: '',
    description: '',
    examType: 'test',
    duration: '',
    reminderDays: [1, 7],
    notes: '',
    color: '#f5576c',
    notificationEnabled: true
  });

  useEffect(() => {
    loadExams();
    loadCourses();
  }, [filter]);

  const loadExams = async () => {
    try {
      setLoading(true);

      let response;
      if (filter === 'upcoming') {
        response = await examReminderAPI.getUpcoming();
      } else if (filter === 'passed') {
        response = await examReminderAPI.getAll({ isPassed: true });
      } else {
        response = await examReminderAPI.getAll({ isActive: true });
      }

      setExams(response.data.data.exams);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getEnrolled();
      setCourses(response.data.data.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const examData = {
        ...formData,
        courseId: formData.courseId || null,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      if (editingExam) {
        await examReminderAPI.update(editingExam.id, examData);
      } else {
        await examReminderAPI.create(examData);
      }

      resetForm();
      loadExams();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam reminder');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam reminder?')) return;

    try {
      await examReminderAPI.delete(id);
      loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam reminder');
    }
  };

  const handleMarkPassed = async (id) => {
    try {
      await examReminderAPI.markPassed(id);
      loadExams();
    } catch (error) {
      console.error('Error marking exam as passed:', error);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      examTitle: exam.examTitle,
      examDate: exam.examDate ? exam.examDate.split('T')[0] : '',
      examTime: exam.examTime || '',
      courseId: exam.courseId || '',
      location: exam.location || '',
      description: exam.description || '',
      examType: exam.examType,
      duration: exam.duration || '',
      reminderDays: exam.reminderDays || [1, 7],
      notes: exam.notes || '',
      color: exam.color || '#f5576c',
      notificationEnabled: exam.notificationEnabled
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      examTitle: '',
      examDate: '',
      examTime: '',
      courseId: '',
      location: '',
      description: '',
      examType: 'test',
      duration: '',
      reminderDays: [1, 7],
      notes: '',
      color: '#f5576c',
      notificationEnabled: true
    });
    setEditingExam(null);
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExamTypeIcon = (type) => {
    switch (type) {
      case 'midterm': return '📚';
      case 'final': return '🎓';
      case 'quiz': return '📋';
      case 'test': return '📝';
      case 'assignment': return '📄';
      case 'presentation': return '🎤';
      default: return '📌';
    }
  };

  const getUrgencyClass = (daysUntil) => {
    if (daysUntil < 0) return 'passed';
    if (daysUntil === 0) return 'today';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  };

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>🔔 Exam Reminders</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Filter Tabs */}
      <div className="exam-filters">
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Active
        </button>
        <button
          className={filter === 'passed' ? 'active' : ''}
          onClick={() => setFilter('passed')}
        >
          Past Exams
        </button>
      </div>

      {/* Add Exam Button */}
      <button
        className="add-exam-btn"
        onClick={() => {
          resetForm();
          setShowAddForm(!showAddForm);
        }}
      >
        {showAddForm ? '− Cancel' : '+ Add New Exam'}
      </button>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="exam-form">
          <h3>{editingExam ? 'Edit Exam Reminder' : 'Create New Exam Reminder'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Exam Title *</label>
              <input
                type="text"
                value={formData.examTitle}
                onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                required
                placeholder="e.g., Calculus Midterm Exam"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam Date *</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Exam Time</label>
                <input
                  type="time"
                  value={formData.examTime}
                  onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Exam Type</label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                >
                  <option value="test">Test</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="assignment">Assignment</option>
                  <option value="presentation">Presentation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 301 or Online"
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="120"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add exam details, topics covered, etc."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Reminder Days Before Exam</label>
              <div className="reminder-days">
                {[1, 3, 7, 14].map(day => (
                  <label key={day} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.reminderDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            reminderDays: [...formData.reminderDays, day].sort((a, b) => a - b)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            reminderDays: formData.reminderDays.filter(d => d !== day)
                          });
                        }
                      }}
                    />
                    <span>{day} {day === 1 ? 'day' : 'days'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color Code</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notificationEnabled}
                    onChange={(e) => setFormData({ ...formData, notificationEnabled: e.target.checked })}
                  />
                  <span>Enable Notifications</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or study tips"
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingExam ? 'Update Exam' : 'Create Exam Reminder'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exams List */}
      <div className="exams-list">
        {loading ? (
          <div className="loading">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="no-exams">
            <p>No exams found</p>
            <p className="hint">Add your first exam reminder to stay on track!</p>
          </div>
        ) : (
          exams.map(exam => {
            const daysUntil = getDaysUntilExam(exam.examDate);
            const urgencyClass = getUrgencyClass(daysUntil);

            return (
              <div key={exam.id} className={`exam-item ${urgencyClass}`} style={{ borderLeftColor: exam.color }}>
                <div className="exam-main">
                  <div className="exam-icon">{getExamTypeIcon(exam.examType)}</div>

                  <div className="exam-content">
                    <div className="exam-title-row">
                      <h4 className="exam-title">{exam.examTitle}</h4>
                      <span className="exam-type-badge">{exam.examType}</span>
                    </div>

                    <div className="exam-date-info">
                      <span className="exam-date">
                        📅 {new Date(exam.examDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {exam.examTime && (
                        <span className="exam-time">⏰ {exam.examTime}</span>
                      )}
                    </div>

                    {urgencyClass !== 'passed' && (
                      <div className={`days-until ${urgencyClass}`}>
                        {daysUntil === 0 ? '🔥 Today!' :
                         daysUntil === 1 ? '⚡ Tomorrow!' :
                         daysUntil < 0 ? '✅ Passed' :
                         `📌 ${daysUntil} days remaining`}
                      </div>
                    )}

                    {exam.description && (
                      <p className="exam-description">{exam.description}</p>
                    )}

                    <div className="exam-meta">
                      {exam.location && (
                        <span className="meta-item">📍 {exam.location}</span>
                      )}
                      {exam.duration && (
                        <span className="meta-item">⏱️ {exam.duration} min</span>
                      )}
                      {exam.notificationEnabled && (
                        <span className="meta-item">🔔 Reminders: {exam.reminderDays.join(', ')} days before</span>
                      )}
                    </div>

                    {exam.notes && (
                      <div className="exam-notes">
                        <strong>Notes:</strong> {exam.notes}
                      </div>
                    )}
                  </div>

                  <div className="exam-actions">
                    <button onClick={() => handleEdit(exam)} title="Edit">✏️</button>
                    {!exam.isPassed && (
                      <button onClick={() => handleMarkPassed(exam.id)} title="Mark as Passed">✓</button>
                    )}
                    <button onClick={() => handleDelete(exam.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExamReminder;
