const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ats_secret_key_123', {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          settings: user.settings
        }
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth SignIn Handler (Stub for enterprise integration)
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    let user = await User.findOne({ googleId });
    if (!user) {
      // Check if email already registered
      user = await User.findOne({ email });

      if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        if (!user.avatar) user.avatar = avatar;
        await user.save();
      } else {
        // Create new account
        user = await User.create({
          name,
          email,
          googleId,
          avatar: avatar || '',
          role: 'user'
        });
      }
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/auth/profile/settings
 * @desc    Update user profile api configurations
 * @access  Private
 */
router.put('/profile/settings', protect, async (req, res) => {
  try {
    const { theme, geminiKey, pineconeKey } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.settings.theme = theme || user.settings.theme;
    user.settings.geminiKey = geminiKey !== undefined ? geminiKey : user.settings.geminiKey;
    user.settings.pineconeKey = pineconeKey !== undefined ? pineconeKey : user.settings.pineconeKey;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        settings: user.settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
