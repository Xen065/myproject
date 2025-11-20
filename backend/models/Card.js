/**
 * ============================================
 * Card Model (Flashcard)
 * ============================================
 * Represents a flashcard with spaced repetition metadata
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Card Content
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  hint: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional explanation after answering'
  },

  // Card Type
  cardType: {
    type: DataTypes.ENUM('basic', 'multiple_choice', 'cloze', 'image', 'ordered'),
    defaultValue: 'basic',
    field: 'card_type'
  },

  // Multiple choice options (stored as JSON)
  options: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'For multiple choice cards: ["option1", "option2", "option3", "option4"]'
  },

  // Image Occlusion fields
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url',
    comment: 'URL path to the image for image occlusion cards'
  },

  occludedRegions: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'occluded_regions',
    comment: 'Array of occluded regions: [{id, x, y, width, height, answer}]'
  },

  // Ordered question fields
  orderedItems: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'ordered_items',
    comment: 'Array of items in correct order: ["item1", "item2", "item3"]'
  },

  // Relationships
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    }
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for template cards
    field: 'user_id',
    comment: 'The student who owns/is learning this card (null for template cards)',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  moduleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'module_id',
    comment: 'Optional: Module this question belongs to',
    references: {
      model: 'course_modules',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },

  // Spaced Repetition Metadata (SM-2 Algorithm)
  easeFactor: {
    type: DataTypes.FLOAT,
    defaultValue: 2.5,
    field: 'ease_factor',
    validate: {
      min: 1.3,
      max: 2.5
    },
    comment: 'SM-2 ease factor (1.3 to 2.5)'
  },

  interval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Number of days until next review'
  },

  repetitions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Number of successful reviews'
  },

  nextReviewDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'next_review_date',
    defaultValue: DataTypes.NOW
  },

  lastReviewDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_review_date'
  },

  // Card Statistics
  timesReviewed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_reviewed',
    validate: {
      min: 0
    }
  },

  timesCorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_correct',
    validate: {
      min: 0
    }
  },

  timesIncorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_incorrect',
    validate: {
      min: 0
    }
  },

  averageResponseTime: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'average_response_time',
    comment: 'Average time to answer in seconds'
  },

  // Card Status
  status: {
    type: DataTypes.ENUM('new', 'learning', 'reviewing', 'mastered'),
    defaultValue: 'new'
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },

  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_suspended',
    comment: 'Temporarily removed from review queue'
  },

  // Tags and Organization
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for organization'
  },

  // Timestamps (createdAt and updatedAt are added automatically)

}, {
  tableName: 'cards',
  timestamps: true,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['next_review_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_active']
    }
  ]
});

/**
 * Calculate next review date using SM-2 algorithm with frequency modes
 * @param {number} quality - Quality rating (1-4)
 * @param {string} frequencyMode - Frequency mode: 'intensive', 'normal', or 'relaxed'
 * @returns {Object} - Updated card metadata
 */
Card.prototype.calculateNextReview = function(quality, frequencyMode = 'normal') {
  let { easeFactor, interval, repetitions } = this;

  // Quality must be between 1 and 4
  quality = Math.max(1, Math.min(4, quality));

  // Define frequency mode settings
  const frequencySettings = {
    intensive: { first: 1, second: 3, multiplier: 0.8 },
    normal: { first: 1, second: 4, multiplier: 1.0 },
    relaxed: { first: 2, second: 7, multiplier: 1.2 }
  };

  const settings = frequencySettings[frequencyMode] || frequencySettings.normal;

  if (quality >= 3) {
    // Correct answer
    if (repetitions === 0) {
      interval = settings.first;
    } else if (repetitions === 1) {
      interval = settings.second;
    } else {
      interval = Math.round(interval * easeFactor * settings.multiplier);
    }
    repetitions++;
  } else {
    // Incorrect answer - reset
    repetitions = 0;
    interval = settings.first;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  easeFactor = Math.max(1.3, Math.min(2.5, easeFactor));

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: new Date()
  };
};

module.exports = Card;
