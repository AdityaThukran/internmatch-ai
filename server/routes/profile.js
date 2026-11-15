const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, profileController.getProfile);
router.put('/', protect, profileController.updateProfile);
router.post('/resume', protect, upload.single('resume'), profileController.uploadResume);

module.exports = router;
