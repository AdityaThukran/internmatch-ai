const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), adminController.getStats);
router.get('/users', protect, authorize('admin'), adminController.getUsers);
router.get('/monitoring-runs', protect, authorize('admin'), adminController.getMonitoringRuns);

module.exports = router;
