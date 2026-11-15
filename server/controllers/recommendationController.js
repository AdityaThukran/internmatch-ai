const Recommendation = require('../models/Recommendation');
const StudentProfile = require('../models/StudentProfile');
const Internship = require('../models/Internship');
const { matchStudentWithInternships } = require('../services/matchingService');
const { formatResponse } = require('../utils/helpers');

/**
 * @route   GET /api/recommendations
 * @desc    Get all recommendations for the current user
 * @access  Private
 */
const getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({
      userId: req.user._id,
    })
      .populate({
        path: 'internshipId',
        match: { isActive: true },
      })
      .sort({ matchScore: -1 });

    // Filter out recommendations where the internship has been deactivated
    const activeRecommendations = recommendations.filter(
      (rec) => rec.internshipId !== null
    );

    return res.status(200).json(
      formatResponse(
        true,
        'Recommendations retrieved successfully',
        activeRecommendations
      )
    );
  } catch (error) {
    console.error('GetRecommendations error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving recommendations'));
  }
};

/**
 * @route   POST /api/recommendations/generate
 * @desc    Generate recommendations for the current user
 * @access  Private
 */
const generateRecommendations = async (req, res) => {
  try {
    // 1. Get student profile
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res
        .status(404)
        .json(
          formatResponse(
            false,
            'Student profile not found. Please create your profile first.'
          )
        );
    }

    if (!profile.skills || profile.skills.length === 0) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            'Please add skills to your profile before generating recommendations.'
          )
        );
    }

    // 2. Get active internships
    const internships = await Internship.find({ isActive: true });

    if (internships.length === 0) {
      return res
        .status(404)
        .json(
          formatResponse(false, 'No active internships found to match against.')
        );
    }

    // 3. Match student with internships (tries AI first, falls back to basic)
    const matchResults = await matchStudentWithInternships(profile, internships);

    // 4. Delete existing recommendations for this user
    await Recommendation.deleteMany({ userId: req.user._id });

    // 5. Save new recommendations
    const recommendations = [];
    for (const result of matchResults) {
      // Only save recommendations with score > 0
      if (result.matchScore > 0) {
        const rec = await Recommendation.create({
          userId: req.user._id,
          internshipId: result.internshipId,
          matchScore: result.matchScore,
          matchedSkills: result.matchedSkills || [],
          missingSkills: result.missingSkills || [],
          matchDetails: result.matchDetails || {},
          generatedAt: new Date(),
        });
        recommendations.push(rec);
      }
    }

    // 6. Fetch populated recommendations sorted by score
    const populatedRecommendations = await Recommendation.find({
      userId: req.user._id,
    })
      .populate('internshipId')
      .sort({ matchScore: -1 });

    return res.status(200).json(
      formatResponse(
        true,
        `Generated ${recommendations.length} recommendations`,
        populatedRecommendations
      )
    );
  } catch (error) {
    console.error('GenerateRecommendations error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error generating recommendations'));
  }
};

module.exports = {
  getRecommendations,
  generateRecommendations,
};
