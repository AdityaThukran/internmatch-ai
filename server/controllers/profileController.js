const StudentProfile = require('../models/StudentProfile');
const { extractResume } = require('../services/aiService');
const { processUploadedResume } = require('../services/resumeExtractor');
const { formatResponse } = require('../utils/helpers');

/**
 * @route   GET /api/profile
 * @desc    Get current user's student profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user._id,
    }).populate('userId', 'name email role createdAt');

    if (!profile) {
      return res
        .status(404)
        .json(formatResponse(false, 'Profile not found'));
    }

    return res
      .status(200)
      .json(formatResponse(true, 'Profile retrieved successfully', profile));
  } catch (error) {
    console.error('GetProfile error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving profile'));
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update current user's student profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'education',
      'skills',
      'interests',
      'location',
      'preferredMode',
      'bio',
      'github',
      'linkedin',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role createdAt');

    if (!profile) {
      // If profile doesn't exist, create one
      const newProfile = await StudentProfile.create({
        userId: req.user._id,
        ...updateData,
      });
      const populatedProfile = await StudentProfile.findById(
        newProfile._id
      ).populate('userId', 'name email role createdAt');
      return res
        .status(201)
        .json(
          formatResponse(true, 'Profile created successfully', populatedProfile)
        );
    }

    return res
      .status(200)
      .json(formatResponse(true, 'Profile updated successfully', profile));
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error updating profile'));
  }
};

/**
 * @route   POST /api/profile/resume
 * @desc    Upload resume and optionally extract data via AI
 * @access  Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(formatResponse(false, 'No file uploaded. Please upload a PDF file.'));
    }

    const filePath = req.file.path;

    // Save file path to profile
    let updateData = { resumeFile: filePath };

    // Try to extract resume data using in-process Node parser first, fallback to AI microservice
    let extractedData = null;
    try {
      extractedData = await processUploadedResume(filePath);
    } catch (parseErr) {
      console.warn('[profileController] processUploadedResume failed, trying AI service:', parseErr.message);
      extractedData = await extractResume(filePath);
    }

    if (extractedData) {
      updateData.extractedProfile = extractedData;
      if (extractedData.degree) updateData.degree = extractedData.degree;
      if (extractedData.institution) updateData.institution = extractedData.institution;
      if (extractedData.location) updateData.location = extractedData.location;
      if (extractedData.github) updateData.github = extractedData.github;
      if (extractedData.bio) updateData.bio = extractedData.bio;

      // If AI extracted skills or other data, optionally merge them
      if (extractedData.skills && Array.isArray(extractedData.skills)) {
        // Get current profile to merge skills
        const currentProfile = await StudentProfile.findOne({
          userId: req.user._id,
        });
        if (currentProfile) {
          const existingSkills = new Set(
            (currentProfile.skills || []).map((s) => s.toLowerCase())
          );
          const newSkills = extractedData.skills.filter(
            (s) => !existingSkills.has(s.toLowerCase())
          );
          if (newSkills.length > 0) {
            updateData.skills = [
              ...(currentProfile.skills || []),
              ...newSkills,
            ];
          }
        }
      }
    } else {
      updateData.extractedProfile = null;
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role createdAt');

    if (!profile) {
      const newProfile = await StudentProfile.create({
        userId: req.user._id,
        ...updateData,
      });
      const populatedProfile = await StudentProfile.findById(
        newProfile._id
      ).populate('userId', 'name email role createdAt');
      return res.status(201).json(
        formatResponse(true, 'Resume uploaded successfully', {
          profile: populatedProfile,
          aiExtracted: !!extractedData,
        })
      );
    }

    return res.status(200).json(
      formatResponse(true, 'Resume uploaded successfully', {
        profile,
        aiExtracted: !!extractedData,
      })
    );
  } catch (error) {
    console.error('UploadResume error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error uploading resume'));
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
};
