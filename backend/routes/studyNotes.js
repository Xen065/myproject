const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');
const StudyNote = require('../models/StudyNote');
const Course = require('../models/Course');
const Card = require('../models/Card');
const StudySession = require('../models/StudySession');
const StudyTask = require('../models/StudyTask');

// Get all notes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      courseId,
      folder,
      isPinned,
      isArchived,
      isFavorite,
      search,
      tags,
      sortBy,
      sortOrder
    } = req.query;

    const whereClause = { userId: req.user.id };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (folder) {
      whereClause.folder = folder;
    }

    if (isPinned !== undefined) {
      whereClause.isPinned = isPinned === 'true';
    }

    if (isArchived !== undefined) {
      whereClause.isArchived = isArchived === 'true';
    }

    if (isFavorite !== undefined) {
      whereClause.isFavorite = isFavorite === 'true';
    }

    // Full-text search
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { contentPlainText: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      whereClause.tags = {
        [Op.contains]: tagArray
      };
    }

    const orderField = sortBy || 'created_at';
    const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const notes = await StudyNote.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        },
        {
          model: Card,
          as: 'card',
          attributes: ['id', 'question', 'answer']
        }
      ],
      order: [
        ['isPinned', 'DESC'],
        [orderField, orderDirection]
      ]
    });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// Get a single note by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        },
        {
          model: Card,
          as: 'card',
          attributes: ['id', 'question', 'answer']
        },
        {
          model: StudySession,
          as: 'studySession',
          attributes: ['id', 'title', 'scheduledDate']
        },
        {
          model: StudyTask,
          as: 'task',
          attributes: ['id', 'title', 'dueDate']
        }
      ]
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment view count
    await note.incrementViewCount();

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note', error: error.message });
  }
});

// Create a new note
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      courseId,
      cardId,
      studySessionId,
      taskId,
      title,
      content,
      noteType,
      folder,
      tags,
      color,
      isPinned,
      isFavorite,
      attachments,
      drawings,
      linkedNotes,
      reminderDate
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        message: 'Title and content are required'
      });
    }

    // Verify course exists if provided
    if (courseId) {
      const course = await Course.findOne({
        where: { id: courseId, userId: req.user.id }
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    // Verify card exists if provided
    if (cardId) {
      const card = await Card.findOne({
        where: { id: cardId, userId: req.user.id }
      });
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
    }

    const note = await StudyNote.create({
      userId: req.user.id,
      courseId: courseId || null,
      cardId: cardId || null,
      studySessionId: studySessionId || null,
      taskId: taskId || null,
      title,
      content,
      noteType: noteType || 'markdown',
      folder: folder || null,
      tags: tags || [],
      color: color || '#FFF9C4',
      isPinned: isPinned || false,
      isFavorite: isFavorite || false,
      attachments: attachments || null,
      drawings: drawings || null,
      linkedNotes: linkedNotes || null,
      reminderDate: reminderDate || null,
      lastEditedAt: new Date()
    });

    const createdNote = await StudyNote.findByPk(note.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        },
        {
          model: Card,
          as: 'card',
          attributes: ['id', 'question', 'answer']
        }
      ]
    });

    res.status(201).json(createdNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
});

// Update a note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const {
      courseId,
      cardId,
      studySessionId,
      taskId,
      title,
      content,
      noteType,
      folder,
      tags,
      color,
      isPinned,
      isArchived,
      isFavorite,
      attachments,
      drawings,
      linkedNotes,
      reminderDate
    } = req.body;

    // Verify course exists if provided
    if (courseId !== undefined && courseId !== null) {
      const course = await Course.findOne({
        where: { id: courseId, userId: req.user.id }
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    // Update fields
    if (courseId !== undefined) note.courseId = courseId;
    if (cardId !== undefined) note.cardId = cardId;
    if (studySessionId !== undefined) note.studySessionId = studySessionId;
    if (taskId !== undefined) note.taskId = taskId;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (noteType !== undefined) note.noteType = noteType;
    if (folder !== undefined) note.folder = folder;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (attachments !== undefined) note.attachments = attachments;
    if (drawings !== undefined) note.drawings = drawings;
    if (linkedNotes !== undefined) note.linkedNotes = linkedNotes;
    if (reminderDate !== undefined) note.reminderDate = reminderDate;

    await note.save();

    const updatedNote = await StudyNote.findByPk(note.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        },
        {
          model: Card,
          as: 'card',
          attributes: ['id', 'question', 'answer']
        }
      ]
    });

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.destroy();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// Get all unique folders
router.get('/meta/folders', authenticate, async (req, res) => {
  try {
    const notes = await StudyNote.findAll({
      where: {
        userId: req.user.id,
        folder: { [Op.ne]: null }
      },
      attributes: ['folder'],
      group: ['folder']
    });

    const folders = notes.map(note => note.folder);

    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Error fetching folders', error: error.message });
  }
});

// Get all unique tags
router.get('/meta/tags', authenticate, async (req, res) => {
  try {
    const notes = await StudyNote.findAll({
      where: {
        userId: req.user.id,
        tags: { [Op.ne]: null }
      },
      attributes: ['tags']
    });

    const allTags = new Set();
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => allTags.add(tag));
      }
    });

    res.json(Array.from(allTags).sort());
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
});

// Search notes (advanced full-text search)
router.post('/search', authenticate, async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const whereClause = {
      userId: req.user.id,
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { contentPlainText: { [Op.like]: `%${query}%` } }
      ]
    };

    // Apply filters
    if (filters) {
      if (filters.courseId) whereClause.courseId = filters.courseId;
      if (filters.folder) whereClause.folder = filters.folder;
      if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = { [Op.contains]: filters.tags };
      }
      if (filters.isPinned !== undefined) whereClause.isPinned = filters.isPinned;
      if (filters.isArchived !== undefined) whereClause.isArchived = filters.isArchived;
      if (filters.isFavorite !== undefined) whereClause.isFavorite = filters.isFavorite;
    }

    const notes = await StudyNote.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'color']
        }
      ],
      order: [
        ['isPinned', 'DESC'],
        ['lastEditedAt', 'DESC']
      ],
      limit: 50
    });

    res.json(notes);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ message: 'Error searching notes', error: error.message });
  }
});

// Toggle pin status
router.post('/:id/pin', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({ message: `Note ${note.isPinned ? 'pinned' : 'unpinned'}`, note });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ message: 'Error toggling pin', error: error.message });
  }
});

// Toggle favorite status
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({ message: `Note ${note.isFavorite ? 'added to' : 'removed from'} favorites`, note });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
});

// Toggle archive status
router.post('/:id/archive', authenticate, async (req, res) => {
  try {
    const note = await StudyNote.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({ message: `Note ${note.isArchived ? 'archived' : 'unarchived'}`, note });
  } catch (error) {
    console.error('Error toggling archive:', error);
    res.status(500).json({ message: 'Error toggling archive', error: error.message });
  }
});

// Get notes statistics
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalNotes, pinnedNotes, archivedNotes, favoriteNotes] = await Promise.all([
      StudyNote.count({ where: { userId } }),
      StudyNote.count({ where: { userId, isPinned: true } }),
      StudyNote.count({ where: { userId, isArchived: true } }),
      StudyNote.count({ where: { userId, isFavorite: true } })
    ]);

    // Get notes by course
    const notesByCourse = await StudyNote.findAll({
      where: { userId, courseId: { [Op.ne]: null } },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'courseId',
        [sequelize.fn('COUNT', sequelize.col('StudyNote.id')), 'count']
      ],
      group: ['courseId', 'course.id', 'course.name']
    });

    res.json({
      totalNotes,
      pinnedNotes,
      archivedNotes,
      favoriteNotes,
      activeNotes: totalNotes - archivedNotes,
      notesByCourse
    });
  } catch (error) {
    console.error('Error fetching notes statistics:', error);
    res.status(500).json({ message: 'Error fetching notes statistics', error: error.message });
  }
});

module.exports = router;
