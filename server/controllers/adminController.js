const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Recommendation = require('../models/Recommendation');
const MonitoringRun = require('../models/MonitoringRun');
const { formatResponse } = require('../utils/helpers');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (admin)
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInternships,
      activeInternships,
      totalApplications,
      totalRecommendations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Internship.countDocuments(),
      Internship.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Recommendation.countDocuments(),
    ]);

    return res.status(200).json(
      formatResponse(true, 'Statistics retrieved successfully', {
        totalUsers,
        totalStudents,
        totalInternships,
        activeInternships,
        totalApplications,
        totalRecommendations,
      })
    );
  } catch (error) {
    console.error('GetStats error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving statistics'));
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (admin)
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find()
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(),
    ]);

    return res.status(200).json(
      formatResponse(true, 'Users retrieved successfully', {
        users,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      })
    );
  } catch (error) {
    console.error('GetUsers error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving users'));
  }
};

/**
 * @route   GET /api/admin/monitoring-runs
 * @desc    Get all monitoring runs
 * @access  Private (admin)
 */
const getMonitoringRuns = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [runs, total] = await Promise.all([
      MonitoringRun.find()
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      MonitoringRun.countDocuments(),
    ]);

    return res.status(200).json(
      formatResponse(true, 'Monitoring runs retrieved successfully', {
        runs,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      })
    );
  } catch (error) {
    console.error('GetMonitoringRuns error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving monitoring runs'));
  }
};

module.exports = {
  getStats,
  getUsers,
  getMonitoringRuns,
};
