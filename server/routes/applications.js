const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, applicationController.getApplications);
router.post('/', protect, applicationController.createApplication);
router.put('/:id', protect, applicationController.updateApplication);

module.exports = router;
