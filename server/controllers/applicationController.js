const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const { formatResponse } = require('../utils/helpers');

/**
 * @route   GET /api/applications
 * @desc    Get all applications for the current user
 * @access  Private
 */
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('internshipId')
      .sort({ updatedAt: -1 });

    return res
      .status(200)
      .json(
        formatResponse(
          true,
          'Applications retrieved successfully',
          applications
        )
      );
  } catch (error) {
    console.error('GetApplications error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving applications'));
  }
};

/**
 * @route   POST /api/applications
 * @desc    Create a new application (save an internship)
 * @access  Private
 */
const createApplication = async (req, res) => {
  try {
    const { internshipId, notes } = req.body;

    if (!internshipId) {
      return res
        .status(400)
        .json(formatResponse(false, 'Internship ID is required'));
    }

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }

    // Check if already applied/saved
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      internshipId,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            'You have already saved/applied to this internship',
            existingApplication
          )
        );
    }

    // Create new application with status=saved
    const application = await Application.create({
      userId: req.user._id,
      internshipId,
      status: 'saved',
      notes: notes || '',
    });

    try {
      await Notification.create({
        userId: req.user._id,
        internshipId: internship._id,
        channel: 'in-app',
        title: `Opportunity Saved: ${internship.title}`,
        message: `Saved "${internship.title}" at ${internship.organization}. Review requirements and submit application in Live Tracker.`,
        sentAt: new Date(),
        deliveryStatus: 'sent',
        isRead: false
      });
    } catch (e) {}

    const populatedApplication = await Application.findById(
      application._id
    ).populate('internshipId');

    return res
      .status(201)
      .json(
        formatResponse(
          true,
          'Application created successfully',
          populatedApplication
        )
      );
  } catch (error) {
    console.error('CreateApplication error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error creating application'));
  }
};

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application status or notes
 * @access  Private
 */
const updateApplication = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updateData = {};
    if (
      status &&
      ['saved', 'applied', 'interviewing', 'offered', 'rejected'].includes(
        status
      )
    ) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('internshipId');

    if (!application) {
      return res
        .status(404)
        .json(formatResponse(false, 'Application not found'));
    }

    if (status) {
      try {
        const stageNames = {
          saved: 'Saved Opportunity',
          applied: 'Applied & Under Review',
          interviewing: 'Interview Scheduled',
          offered: 'Official Offer Extended',
          rejected: 'Archived'
        };
        await Notification.create({
          userId: req.user._id,
          internshipId: application.internshipId?._id || null,
          channel: 'in-app',
          title: `Milestone: ${stageNames[status] || status}`,
          message: `Your application to "${application.internshipId?.title || 'Internship'}" at ${application.internshipId?.organization || 'Company'} progressed to "${stageNames[status] || status}".`,
          sentAt: new Date(),
          deliveryStatus: 'sent',
          isRead: false
        });
      } catch (e) {}
    }

    return res
      .status(200)
      .json(
        formatResponse(true, 'Application updated successfully', application)
      );
  } catch (error) {
    console.error('UpdateApplication error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json(formatResponse(false, 'Application not found'));
    }
    return res
      .status(500)
      .json(formatResponse(false, 'Server error updating application'));
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
};
