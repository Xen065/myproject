import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NotesManager.css';

const NotesManager = ({ onClose, courses, initialCourseId, initialCardId }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pinned', 'favorites', 'archived'

  // Editor states
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' or 'preview'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: initialCourseId || '',
    cardId: initialCardId || null,
    folder: '',
    tags: [],
    color: '#FFF9C4',
    noteType: 'markdown'
  });
  const [tagInput, setTagInput] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadNotes();
    loadFolders();
    loadTags();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notes, searchQuery, selectedFolder, selectedCourseFilter, filterType]);

  const loadNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study/notes/meta/folders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(response.data);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadTags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study/notes/meta/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    // Filter by type
    if (filterType === 'pinned') {
      filtered = filtered.filter(n => n.isPinned && !n.isArchived);
    } else if (filterType === 'favorites') {
      filtered = filtered.filter(n => n.isFavorite && !n.isArchived);
    } else if (filterType === 'archived') {
      filtered = filtered.filter(n => n.isArchived);
    } else {
      filtered = filtered.filter(n => !n.isArchived);
    }

    // Filter by folder
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(n => n.folder === selectedFolder);
    }

    // Filter by course
    if (selectedCourseFilter !== 'all') {
      filtered = filtered.filter(n => n.courseId === parseInt(selectedCourseFilter));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        (n.contentPlainText && n.contentPlainText.toLowerCase().includes(query))
      );
    }

    setFilteredNotes(filtered);
  };

  const handleCreateNote = () => {
    setFormData({
      title: '',
      content: '',
      courseId: initialCourseId || '',
      cardId: initialCardId || null,
      folder: selectedFolder !== 'all' ? selectedFolder : '',
      tags: [],
      color: '#FFF9C4',
      noteType: 'markdown'
    });
    setSelectedNote(null);
    setShowEditor(true);
    setEditorMode('edit');
  };

  const handleEditNote = async (note) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/study/notes/${note.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fullNote = response.data;
      setFormData({
        title: fullNote.title,
        content: fullNote.content,
        courseId: fullNote.courseId || '',
        cardId: fullNote.cardId || null,
        folder: fullNote.folder || '',
        tags: fullNote.tags || [],
        color: fullNote.color,
        noteType: fullNote.noteType
      });
      setSelectedNote(fullNote);
      setShowEditor(true);
      setEditorMode('edit');
    } catch (error) {
      console.error('Error loading note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!formData.title || !formData.content) {
      alert('Title and content are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (selectedNote) {
        await axios.put(`http://localhost:5000/api/study/notes/${selectedNote.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/study/notes', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowEditor(false);
      setSelectedNote(null);
      loadNotes();
      loadFolders();
      loadTags();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/study/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/study/notes/${noteId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/study/notes/${noteId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleArchive = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/study/notes/${noteId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotes();
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const renderMarkdown = (markdown) => {
    // Simple markdown rendering
    let html = markdown
      .replace(/### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    return { __html: html };
  };

  const handleExportPDF = (note) => {
    // Simple export - in production, use a library like jsPDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${note.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div class="meta">
            ${note.course ? `Course: ${note.course.name}<br>` : ''}
            ${note.folder ? `Folder: ${note.folder}<br>` : ''}
            Created: ${new Date(note.createdAt).toLocaleDateString()}
          </div>
          <div>${note.content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const noteColors = [
    { name: 'Yellow', value: '#FFF9C4' },
    { name: 'Pink', value: '#FCE4EC' },
    { name: 'Blue', value: '#E3F2FD' },
    { name: 'Green', value: '#E8F5E9' },
    { name: 'Orange', value: '#FFF3E0' },
    { name: 'Purple', value: '#F3E5F5' }
  ];

  return (
    <div className="notes-modal-overlay">
      <div className="notes-modal">
        <div className="notes-header">
          <h2>📝 Notes Manager</h2>
          <div className="header-actions">
            <button className="icon-btn" onClick={handleCreateNote} title="New Note">
              ➕
            </button>
            <button className="icon-btn" onClick={() => setView(view === 'grid' ? 'list' : 'grid')} title="Toggle View">
              {view === 'grid' ? '📋' : '⊞'}
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {!showEditor ? (
          <div className="notes-content">
            {/* Filters */}
            <div className="notes-filters">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="all">All Notes</option>
                <option value="pinned">📌 Pinned</option>
                <option value="favorites">⭐ Favorites</option>
                <option value="archived">📦 Archived</option>
              </select>

              <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} className="filter-select">
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>📁 {folder}</option>
                ))}
              </select>

              <select value={selectedCourseFilter} onChange={(e) => setSelectedCourseFilter(e.target.value)} className="filter-select">
                <option value="all">All Courses</option>
                {courses && courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            {/* Notes Grid/List */}
            <div className={`notes-${view}`}>
              {filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className="note-card"
                    style={{ backgroundColor: note.color }}
                  >
                    <div className="note-card-header">
                      <h4>{note.title}</h4>
                      <div className="note-actions">
                        <button onClick={() => handleTogglePin(note.id)} className="action-icon" title="Pin">
                          {note.isPinned ? '📌' : '📍'}
                        </button>
                        <button onClick={() => handleToggleFavorite(note.id)} className="action-icon" title="Favorite">
                          {note.isFavorite ? '⭐' : '☆'}
                        </button>
                      </div>
                    </div>

                    <div className="note-preview">
                      {note.contentPlainText ? note.contentPlainText.substring(0, 150) + '...' : ''}
                    </div>

                    {note.course && (
                      <div className="note-meta">
                        📚 {note.course.name}
                      </div>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="note-tag">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="note-card-footer">
                      <span className="note-date">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="note-footer-actions">
                        <button onClick={() => handleEditNote(note)} className="btn-small">Edit</button>
                        <button onClick={() => handleExportPDF(note)} className="btn-small">PDF</button>
                        <button onClick={() => handleToggleArchive(note.id)} className="btn-small">
                          {note.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} className="btn-small danger">Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notes">
                  <p>No notes found. Create your first note!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="note-editor">
            <div className="editor-toolbar">
              <button
                className={`mode-btn ${editorMode === 'edit' ? 'active' : ''}`}
                onClick={() => setEditorMode('edit')}
              >
                ✏️ Edit
              </button>
              <button
                className={`mode-btn ${editorMode === 'preview' ? 'active' : ''}`}
                onClick={() => setEditorMode('preview')}
              >
                👁️ Preview
              </button>
              <button className="mode-btn" onClick={() => setShowCanvas(!showCanvas)}>
                ✍️ Draw
              </button>
            </div>

            <div className="editor-content">
              <input
                type="text"
                className="editor-title"
                placeholder="Note title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              {editorMode === 'edit' ? (
                <textarea
                  className="editor-textarea"
                  placeholder="Write your note here... (Markdown supported)"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              ) : (
                <div className="editor-preview" dangerouslySetInnerHTML={renderMarkdown(formData.content)} />
              )}

              {showCanvas && (
                <div className="canvas-container">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="drawing-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <button className="btn-small" onClick={clearCanvas}>Clear</button>
                </div>
              )}

              <div className="editor-meta">
                <div className="meta-row">
                  <label>Course:</label>
                  <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
                    <option value="">None</option>
                    {courses && courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div className="meta-row">
                  <label>Folder:</label>
                  <input
                    type="text"
                    value={formData.folder}
                    onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                    placeholder="Folder name..."
                    list="folders-list"
                  />
                  <datalist id="folders-list">
                    {folders.map(folder => (
                      <option key={folder} value={folder} />
                    ))}
                  </datalist>
                </div>

                <div className="meta-row">
                  <label>Tags:</label>
                  <div className="tags-input">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="tag-item">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)}>×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                    />
                  </div>
                </div>

                <div className="meta-row">
                  <label>Color:</label>
                  <div className="color-picker">
                    {noteColors.map(color => (
                      <button
                        key={color.value}
                        className={`color-btn ${formData.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="editor-actions">
                <button className="btn-save" onClick={handleSaveNote}>
                  {selectedNote ? 'Update Note' : 'Save Note'}
                </button>
                <button className="btn-cancel" onClick={() => setShowEditor(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;
