const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * JWT verification middleware.
 * Extracts the token from the Authorization header (Bearer token),
 * verifies it, and attaches the user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
      data: null,
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find the user and exclude passwordHash
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired',
      data: null,
    });
  }
};

/**
 * Role-checking middleware factory.
 * Accepts allowed roles and returns middleware that checks req.user.role.
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
        data: null,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
