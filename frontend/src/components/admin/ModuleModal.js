/**
 * Module Modal Component
 */
import React, { useState, useEffect } from 'react';
import { adminCourseModuleAPI } from '../../services/adminApi';
import './Modal.css';

const ModuleModal = ({ courseId, module, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '📝',
    estimatedDuration: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (module && module.id) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        icon: module.icon || '📝',
        estimatedDuration: module.estimatedDuration || '',
      });
    }
  }, [module]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      const data = {
        courseId,
        ...formData,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
      };

      if (module?.id) {
        await adminCourseModuleAPI.update(module.id, data);
      } else {
        await adminCourseModuleAPI.create(data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save module');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{module?.id ? 'Edit Module' : 'Add New Module'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              maxLength={2}
              className="emoji-input"
              placeholder="📝"
            />
            <small className="help-text">Single emoji only</small>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Estimated Duration (minutes)</label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              min="1"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleModal;
