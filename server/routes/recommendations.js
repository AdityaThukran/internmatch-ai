const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, recommendationController.getRecommendations);
router.post('/generate', protect, recommendationController.generateRecommendations);

module.exports = router;
