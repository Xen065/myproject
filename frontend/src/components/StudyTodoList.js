import React, { useState, useEffect } from 'react';
import { studyTaskAPI, courseAPI } from '../services/api';
import './StudyTodoList.css';

const StudyTodoList = ({ onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    courseId: '',
    estimatedDuration: '',
    tags: '',
    linkedToCalendar: true,
    reminderEnabled: false,
    reminderDate: '',
    notes: ''
  });

  useEffect(() => {
    loadTasks();
    loadCourses();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filter === 'pending') {
        params.status = 'pending';
      } else if (filter === 'completed') {
        params.status = 'completed';
      }

      const response = await studyTaskAPI.getAll(params);
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
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
      const taskData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        courseId: formData.courseId || null,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
      };

      if (editingTask) {
        await studyTaskAPI.update(editingTask.id, taskData);
      } else {
        await studyTaskAPI.create(taskData);
      }

      resetForm();
      loadTasks();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await studyTaskAPI.delete(id);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (task.isCompleted) {
        await studyTaskAPI.update(task.id, { isCompleted: false, status: 'pending' });
      } else {
        await studyTaskAPI.complete(task.id);
      }
      loadTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority,
      courseId: task.courseId || '',
      estimatedDuration: task.estimatedDuration || '',
      tags: task.tags ? task.tags.join(', ') : '',
      linkedToCalendar: task.linkedToCalendar,
      reminderEnabled: task.reminderEnabled,
      reminderDate: task.reminderDate ? task.reminderDate.split('T')[0] : '',
      notes: task.notes || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      courseId: '',
      estimatedDuration: '',
      tags: '',
      linkedToCalendar: true,
      reminderEnabled: false,
      reminderDate: '',
      notes: ''
    });
    setEditingTask(null);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>✅ Todo List</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Filter Tabs */}
      <div className="todo-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter(t => !t.isCompleted).length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.isCompleted).length})
        </button>
      </div>

      {/* Add Task Button */}
      <button
        className="add-task-btn"
        onClick={() => {
          resetForm();
          setShowAddForm(!showAddForm);
        }}
      >
        {showAddForm ? '− Cancel' : '+ Add New Task'}
      </button>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="task-form">
          <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter task title"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add task description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  <option value="">None</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Est. Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  placeholder="30"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="study, important, review"
              />
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.linkedToCalendar}
                  onChange={(e) => setFormData({ ...formData, linkedToCalendar: e.target.checked })}
                />
                <span>Link to Calendar</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                />
                <span>Enable Reminder</span>
              </label>
            </div>

            {formData.reminderEnabled && (
              <div className="form-group">
                <label>Reminder Date</label>
                <input
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingTask ? 'Update Task' : 'Create Task'}
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

      {/* Tasks List */}
      <div className="tasks-list">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found</p>
            <p className="hint">Create your first task to get started!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''} priority-${task.priority}`}>
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task)}
                  className="task-checkbox"
                />

                <div className="task-content">
                  <div className="task-title-row">
                    <span className="priority-icon">{getPriorityIcon(task.priority)}</span>
                    <h4 className="task-title">{task.title}</h4>
                    {task.linkedToCalendar && <span className="calendar-badge">📅</span>}
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-meta">
                    {task.dueDate && (
                      <span className="meta-item">
                        📆 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.estimatedDuration && (
                      <span className="meta-item">⏱️ {task.estimatedDuration} min</span>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <span className="meta-item tags">
                        {task.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button onClick={() => handleEdit(task)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(task.id)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyTodoList;
