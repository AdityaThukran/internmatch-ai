const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { formatResponse } = require('../utils/helpers');

/**
 * Generate JWT token for a user.
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = [
  // Validation rules
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'recruiter'])
    .withMessage('Invalid role'),

  // Handler
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(formatResponse(false, 'Validation failed', errors.array()));
      }

      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res
          .status(400)
          .json(formatResponse(false, 'Email already registered'));
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || 'student',
      });

      // Create empty StudentProfile if role is student
      if (user.role === 'student') {
        await StudentProfile.create({
          userId: user._id,
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Return user data (without passwordHash)
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt,
      };

      return res.status(201).json(
        formatResponse(true, 'User registered successfully', {
          user: userData,
          token,
        })
      );
    } catch (error) {
      console.error('Register error:', error.message);
      return res
        .status(500)
        .json(formatResponse(false, 'Server error during registration'));
    }
  },
];

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
const login = [
  // Validation rules
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),

  // Handler
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json(formatResponse(false, 'Validation failed', errors.array()));
      }

      const { email, password } = req.body;

      // Find user by email (include passwordHash for comparison)
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res
          .status(401)
          .json(formatResponse(false, 'Invalid email or password'));
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res
          .status(401)
          .json(formatResponse(false, 'Invalid email or password'));
      }

      // Generate token
      const token = generateToken(user._id);

      // Return user data (without passwordHash)
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt,
      };

      return res.status(200).json(
        formatResponse(true, 'Login successful', {
          user: userData,
          token,
        })
      );
    } catch (error) {
      console.error('Login error:', error.message);
      return res
        .status(500)
        .json(formatResponse(false, 'Server error during login'));
    }
  },
];

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;

    let userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      notificationSettings: user.notificationSettings,
      createdAt: user.createdAt,
    };

    // If student, also populate profile
    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: user._id });
      userData.profile = profile;
    }

    return res
      .status(200)
      .json(formatResponse(true, 'User data retrieved', userData));
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving user data'));
  }
};

module.exports = {
  register,
  login,
  getMe,
};
