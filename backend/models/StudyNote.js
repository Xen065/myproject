const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudyNote = sequelize.define('StudyNote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'card_id',
    references: {
      model: 'cards',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Link note to a specific flashcard'
  },
  studySessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'study_session_id',
    references: {
      model: 'study_sessions',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Link note to a study session'
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'task_id',
    references: {
      model: 'study_tasks',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Link note to a task'
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'Note content in markdown format'
  },
  contentPlainText: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'content_plain_text',
    comment: 'Plain text version for full-text search'
  },
  noteType: {
    type: DataTypes.ENUM('text', 'markdown', 'drawing', 'mixed'),
    allowNull: false,
    defaultValue: 'markdown',
    field: 'note_type',
    comment: 'Type of note content'
  },
  folder: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Folder/category for organization'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of tags for categorization'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#FFF9C4',
    comment: 'Note card color'
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_pinned',
    comment: 'Whether note is pinned to top'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_archived',
    comment: 'Whether note is archived'
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_favorite',
    comment: 'Whether note is marked as favorite'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file attachments (images, PDFs, etc.)'
  },
  drawings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Canvas drawing data for handwritten notes'
  },
  linkedNotes: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'linked_notes',
    comment: 'Array of note IDs that are linked to this note'
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reminder_date',
    comment: 'Optional reminder for this note'
  },
  lastEditedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_edited_at'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'view_count',
    comment: 'Number of times note was viewed'
  }
}, {
  tableName: 'study_notes',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['card_id']
    },
    {
      fields: ['is_pinned']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['is_favorite']
    },
    {
      fields: ['folder']
    },
    {
      fields: ['created_at']
    },
    {
      name: 'content_search_idx',
      fields: ['content_plain_text'],
      type: 'FULLTEXT'
    }
  ]
});

// Instance method to update view count
StudyNote.prototype.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Instance method to update last edited timestamp
StudyNote.prototype.markAsEdited = async function() {
  this.lastEditedAt = new Date();
  await this.save();
};

// Instance method to extract plain text from markdown
StudyNote.prototype.updatePlainText = function() {
  if (this.content) {
    // Remove markdown syntax for plain text search
    let plainText = this.content
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*|__/g, '') // Bold
      .replace(/\*|_/g, '') // Italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/`{1,3}[^`]+`{1,3}/g, '') // Code
      .replace(/>\s/g, '') // Blockquotes
      .replace(/[-*+]\s/g, '') // Lists
      .replace(/\n+/g, ' ') // Newlines
      .trim();

    this.contentPlainText = plainText;
  }
};

// Hook to update plain text before save
StudyNote.beforeSave((note) => {
  note.updatePlainText();
  if (note.changed('content')) {
    note.lastEditedAt = new Date();
  }
});

module.exports = StudyNote;
