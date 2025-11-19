/**
 * ============================================
 * User Routes
 * ============================================
 * User profile and settings
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { User } = require('../models');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    const user = await User.findByPk(req.user.id);

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

/**
 * @route   PUT /api/users/settings/frequency-mode
 * @desc    Update user's flashcard frequency mode
 * @access  Private
 */
router.put('/settings/frequency-mode', protect, async (req, res) => {
  try {
    const { frequencyMode } = req.body;

    // Validate frequency mode
    const validModes = ['intensive', 'normal', 'relaxed'];
    if (!frequencyMode || !validModes.includes(frequencyMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency mode. Must be: intensive, normal, or relaxed'
      });
    }

    const user = await User.findByPk(req.user.id);
    user.frequencyMode = frequencyMode;
    await user.save();

    res.json({
      success: true,
      message: 'Frequency mode updated successfully',
      data: {
        frequencyMode: user.frequencyMode
      }
    });
  } catch (error) {
    console.error('Update frequency mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating frequency mode'
    });
  }
});

/**
 * @route   GET /api/users/settings/frequency-mode
 * @desc    Get user's current flashcard frequency mode
 * @access  Private
 */
router.get('/settings/frequency-mode', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: {
        frequencyMode: user.frequencyMode || 'normal'
      }
    });
  } catch (error) {
    console.error('Get frequency mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching frequency mode'
    });
  }
});

module.exports = router;
