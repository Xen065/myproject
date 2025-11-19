/**
 * Content Modal Component - For adding/editing course content (videos, PDFs, files)
 */
import React, { useState, useEffect } from 'react';
import { adminCourseContentAPI } from '../../services/adminApi';
import './Modal.css';

const ContentModal = ({ courseId, content, modules, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'video',
    moduleId: '',
    externalUrl: '',
    duration: '',
    file: null,
    thumbnail: null,
    isFree: false,
    isDownloadable: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (content?.id) {
      setFormData({
        title: content.title || '',
        description: content.description || '',
        contentType: content.contentType || 'video',
        moduleId: content.moduleId || '',
        externalUrl: content.externalUrl || '',
        duration: content.duration || '',
        file: null,
        thumbnail: null,
        isFree: content.isFree || false,
        isDownloadable: content.isDownloadable !== false,
      });
    } else if (content?.moduleId) {
      setFormData({ ...formData, moduleId: content.moduleId });
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.file && !formData.externalUrl && !content?.id) {
      setError('Please upload a file or provide an external URL');
      return;
    }

    try {
      setSaving(true);
      const data = {
        courseId,
        ...formData,
        moduleId: formData.moduleId || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      if (content?.id) {
        await adminCourseContentAPI.update(content.id, data);
      } else {
        await adminCourseContentAPI.create(data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save content');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{content?.id ? 'Edit Content' : 'Add New Content'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Content Type *</label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                required
              >
                <option value="video">🎥 Video</option>
                <option value="pdf">📄 PDF Document</option>
                <option value="document">📝 Document (Word, PPT, etc.)</option>
                <option value="image">🖼️ Image</option>
                <option value="audio">🎵 Audio</option>
                <option value="link">🔗 External Link</option>
              </select>
            </div>

            <div className="form-group">
              <label>Module</label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              >
                <option value="">No Module</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.icon} {mod.title}
                  </option>
                ))}
              </select>
            </div>
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

          {formData.contentType === 'link' ? (
            <div className="form-group">
              <label>External URL (YouTube, Vimeo, etc.) *</label>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Upload File {!content?.id && '*'}</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  accept={
                    formData.contentType === 'video' ? 'video/*' :
                    formData.contentType === 'pdf' ? '.pdf' :
                    formData.contentType === 'image' ? 'image/*' :
                    formData.contentType === 'audio' ? 'audio/*' :
                    '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt'
                  }
                />
                {formData.file && <small>Selected: {formData.file.name}</small>}
              </div>

              <div className="form-group">
                <label>Thumbnail (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                  accept="image/*"
                />
              </div>
            </>
          )}

          {(formData.contentType === 'video' || formData.contentType === 'audio') && (
            <div className="form-group">
              <label>Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="1"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                />
                <span>Free Preview (accessible without enrollment)</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isDownloadable}
                  onChange={(e) => setFormData({ ...formData, isDownloadable: e.target.checked })}
                />
                <span>Allow Download</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
