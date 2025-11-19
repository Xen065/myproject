/**
 * ============================================
 * CourseContent Model
 * ============================================
 * Represents course content items (videos, PDFs, documents, etc.)
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseContent = sequelize.define('CourseContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Content Information
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Content Type
  contentType: {
    type: DataTypes.ENUM('video', 'pdf', 'document', 'link', 'image', 'audio'),
    allowNull: false,
    field: 'content_type'
  },

  // File Information
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'file_name',
    comment: 'Original file name'
  },

  filePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'file_path',
    comment: 'Path to uploaded file or URL for external content'
  },

  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size',
    comment: 'File size in bytes'
  },

  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type'
  },

  // Video specific
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds (for video/audio)'
  },

  thumbnailPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_path',
    comment: 'Path to thumbnail image'
  },

  // External content
  externalUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'external_url',
    comment: 'URL for external content (YouTube, Vimeo, etc.)'
  },

  // Organization
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'order_index',
    comment: 'Order within the module'
  },

  // Relationships
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'module_id',
    references: {
      model: 'course_modules',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },

  // Status
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_published'
  },

  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_free',
    comment: 'Whether this content is free to access without enrollment'
  },

  // Access control
  isDownloadable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_downloadable'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'course_contents',
  timestamps: true,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['module_id']
    },
    {
      fields: ['content_type']
    },
    {
      fields: ['order_index']
    },
    {
      fields: ['is_published']
    }
  ]
});

module.exports = CourseContent;
