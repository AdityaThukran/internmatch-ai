const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', internshipController.getInternships);
router.get('/:id', internshipController.getInternship);
router.post('/', protect, authorize('admin', 'recruiter'), internshipController.createInternship);
router.put('/:id', protect, authorize('admin', 'recruiter'), internshipController.updateInternship);
router.delete('/:id', protect, authorize('admin'), internshipController.deleteInternship);

module.exports = router;
